import argparse
import socket
import threading
import time
from fnmatch import fnmatch
from io import BytesIO
from typing import Dict, List, Tuple

from obspy import Stream, UTCDateTime, read

from simulation_utils import generate_synthetic_stream

HEADER_SIGNATURE = b"SL"
RECORD_SIZE = 512

# Default synthetic station set matching seeded stations
DEFAULT_STATIONS = [
    {"name": "PTH01", "code": "PPL01", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
    {"name": "PTH02", "code": "PPL02", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
    {"name": "PTH03", "code": "PPL03", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
    {"name": "PTH04", "code": "PPL04", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
    {"name": "PTH05", "code": "PPL05", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
    {"name": "PTH07", "code": "PPL07", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
    {"name": "PTH08", "code": "PPL08", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
    {"name": "PTHC02", "code": "TCH02", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
    {"name": "PTHC04", "code": "TCH04", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
    {"name": "PTHC14", "code": "TCH14", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
    {"name": "PTHC17", "code": "TCH17", "network": "PP", "channels": ["DPZ", "DPN", "DPE"]},
]


def chunk_records(stream: Stream) -> List[Dict[str, bytes]]:
    records: List[Dict[str, bytes]] = []
    for trace in stream:
        buffer = BytesIO()
        trace.write(buffer, format="MSEED", reclen=RECORD_SIZE)
        payload = buffer.getvalue()
        if len(payload) == 0 or len(payload) % RECORD_SIZE != 0:
            raise ValueError("miniSEED payload must be a positive multiple of 512 bytes")
        meta = {
          "network": trace.stats.network.upper(),
          "station": trace.stats.station.upper(),
          "location": (trace.stats.location or "").upper(),
          "channel": trace.stats.channel.upper(),
        }
        for i in range(0, len(payload), RECORD_SIZE):
            record_bytes = payload[i : i + RECORD_SIZE]
            entry = dict(meta)
            entry["bytes"] = record_bytes
            records.append(entry)
    return records


def compute_record_interval(stream: Stream, records: List[Dict[str, bytes]]) -> float:
    total_duration = 0.0
    for trace in stream:
        total_duration += trace.stats.npts / trace.stats.sampling_rate
    if total_duration == 0 or not records:
        return 0.0
    return total_duration / len(records)


def format_sequence(seq: int) -> bytes:
    if seq < 0 or seq > 0xFFFFFF:
        seq = seq % 0x1000000
    return f"{seq:06X}".encode()


class SeedLinkSession:
    def __init__(
        self,
        conn: socket.socket,
        address: Tuple[str, int],
        records: List[Dict[str, bytes]],
        record_interval: float,
        loop: bool,
        realtime: bool,
        interval_override: bool,
        available_pairs: set,
    ):
        self.conn = conn
        self.address = address
        self.records = records
        self.record_interval = record_interval
        self.loop = loop
        self.realtime = realtime
        self.interval_override = interval_override
        self.available_pairs = available_pairs
        self.station_filters: set = set()
        self.selector_filters: List[str] = []

    def run(self):
        try:
            self._handle_commands()
            self._stream_records()
        except Exception as exc:
            print(f"Session error for {self.address}: {exc}")
        finally:
            self.conn.close()
            print(f"Connection closed for {self.address}")

    def _handle_commands(self):
        while True:
            line = self._read_command()
            if line is None:
                raise ConnectionError("client disconnected before streaming")
            upper = line.upper()
            if upper == "HELLO":
                self._send_response(b"SeedLink v4.0 (MockServer)\r\n")
            elif upper.startswith("STATION"):
                parts = line.split()
                if len(parts) < 3:
                    self._send_response(b"ERROR\r\n")
                    continue
                station_code = parts[1].upper()
                network_code = parts[2].upper()
                pair = (network_code, station_code)
                if self.available_pairs and pair not in self.available_pairs:
                    self._send_response(b"ERROR\r\n")
                else:
                    self.station_filters.add(pair)
                    self._send_ok()
            elif upper.startswith("SELECT"):
                parts = line.split()
                if len(parts) < 2:
                    self._send_response(b"ERROR\r\n")
                    continue
                for selector in parts[1:]:
                    self.selector_filters.append(selector.upper())
                self._send_ok()
            elif upper.startswith(("DATA", "FETCH", "TIME")):
                self._send_ok()
            elif upper == "END":
                break
            elif upper.startswith("INFO"):
                self._send_response(b"ERROR\r\n")
            else:
                self._send_response(b"ERROR\r\n")

    def _stream_records(self):
        if not self.records:
            print("No records to stream; closing connection")
            return

        matching_records = [rec for rec in self.records if self._record_matches(rec)]
        if not matching_records:
            print("No records matched the requested streams; closing connection")
            return

        sequence = 1
        while True:
            for record in matching_records:
                header = HEADER_SIGNATURE + format_sequence(sequence)
                packet = header + record["bytes"]
                self.conn.sendall(packet)
                sequence += 1
                if (self.realtime or self.interval_override) and self.record_interval > 0:
                    time.sleep(self.record_interval)
            if not self.loop:
                break

    def _record_matches(self, record: Dict[str, bytes]) -> bool:
        if self.station_filters:
            if (record["network"], record["station"]) not in self.station_filters:
                return False

        if self.selector_filters:
            channel = record["channel"]
            location = record["location"] or ""
            combined = f"{location or '--'}{channel}"
            for selector in self.selector_filters:
                sel = selector.upper()
                if len(sel) <= 3:
                    if fnmatch(channel, sel):
                        return True
                else:
                    if fnmatch(combined, sel):
                        return True
            return False

        return True

    def _read_command(self) -> str:
        data = bytearray()
        while True:
            chunk = self.conn.recv(1)
            if not chunk:
                return None
            if chunk == b"\r":
                self.conn.setblocking(False)
                try:
                    nxt = self.conn.recv(1)
                    if nxt != b"\n" and nxt:
                        data.extend(nxt)
                except BlockingIOError:
                    pass
                finally:
                    self.conn.setblocking(True)
                return data.decode().strip()
            else:
                data.extend(chunk)

    def _send_ok(self):
        self._send_response(b"OK\r\n")

    def _send_response(self, payload: bytes):
        self.conn.sendall(payload)


class SeedLinkMockServer:
    def __init__(
        self,
        host: str,
        port: int,
        stream: Stream,
        loop: bool,
        realtime: bool,
        record_interval: float,
    ):
        self.host = host
        self.port = port
        self.stream = stream
        self.records = chunk_records(stream)
        self.available_pairs = {(record["network"], record["station"]) for record in self.records}
        computed_interval = compute_record_interval(stream, self.records)
        self._interval_override = record_interval is not None
        self.record_interval = computed_interval if record_interval is None else max(record_interval, 0.0)
        self.loop = loop
        self.realtime = realtime or (self._interval_override and self.record_interval > 0)

    def serve_forever(self):
        print(f"SeedLink mock server listening on {self.host}:{self.port}")
        if (self.realtime or self._interval_override) and self.record_interval > 0:
            print(f"Realtime pacing {self.record_interval:.3f}s per record")

        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind((self.host, self.port))
            sock.listen()
            while True:
                conn, address = sock.accept()
                print(f"Client connected from {address}")
                session = SeedLinkSession(
                    conn,
                    address,
                    self.records,
                    self.record_interval,
                    self.loop,
                    self.realtime,
                    interval_override=self._interval_override,
                    available_pairs=self.available_pairs,
                )
                threading.Thread(target=session.run, daemon=True).start()


def parse_arguments():
    parser = argparse.ArgumentParser(description="Run a minimal SeedLink-like mock server.")
    parser.add_argument("--host", default="127.0.0.1", help="Host/IP to bind")
    parser.add_argument("--port", type=int, default=18000, help="Port to listen on")
    parser.add_argument("--seed-file", help="miniSEED file to stream")
    parser.add_argument("--network", default="PP", help="Network code for synthetic generation")
    parser.add_argument("--station", default="PPL01", help="Station code for synthetic generation")
    parser.add_argument("--channel", default="DPZ", help="Channel code for synthetic generation")
    parser.add_argument("--duration", type=float, default=60.0, help="Synthetic trace duration in seconds")
    parser.add_argument("--sampling-rate", type=float, default=100.0, help="Synthetic trace sampling rate in Hz")
    parser.add_argument("--frequency", type=float, default=1.0, help="Dominant frequency of synthetic sine")
    parser.add_argument("--loop", action="store_true", help="Loop records indefinitely")
    parser.add_argument("--realtime", action="store_true", help="Sleep between records based on sampling interval")
    parser.add_argument(
        "--record-interval",
        type=float,
        help="Override seconds per record when streaming (default derives from sampling rate)",
    )
    parser.add_argument(
        "--use-default-stations",
        action="store_true",
        help="Generate synthetic streams for all default stations/channels"
    )
    return parser.parse_args()


def main():
    args = parse_arguments()

    if args.seed_file:
        stream = read(args.seed_file)
        print(f"Loaded {len(stream)} trace(s) from {args.seed_file}")
        if len(stream):
            first_start = min(trace.stats.starttime for trace in stream)
            now = UTCDateTime()
            offset = now - first_start
            if abs(offset) > 0:
                for trace in stream:
                    trace.stats.starttime += offset
                new_start = min(trace.stats.starttime for trace in stream)
                print(f"Adjusted start times by {offset:.2f} s so the earliest trace begins at {new_start}")
    elif args.use_default_stations:
        stream = Stream()
        for station in DEFAULT_STATIONS:
            for channel in station["channels"]:
                stream += generate_synthetic_stream(
                    network=station["network"],
                    station=station["code"],
                    channel=channel,
                    duration=args.duration,
                    sampling_rate=args.sampling_rate,
                    frequency=args.frequency,
                )
        print(f"Generated synthetic traces for {len(DEFAULT_STATIONS)} stations x channels")
    else:
        stream = generate_synthetic_stream(
            network=args.network,
            station=args.station,
            channel=args.channel,
            duration=args.duration,
            sampling_rate=args.sampling_rate,
            frequency=args.frequency,
        )
        first = stream[0]
        print(
            "Generated synthetic trace with "
            f"{first.stats.sampling_rate} Hz sampling and {first.stats.npts} samples"
        )

    server = SeedLinkMockServer(
        host=args.host,
        port=args.port,
        stream=stream,
        loop=args.loop,
        realtime=args.realtime,
        record_interval=args.record_interval,
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
