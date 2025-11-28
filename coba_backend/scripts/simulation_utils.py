import math
from obspy import Stream, Trace, UTCDateTime


def generate_synthetic_stream(network: str, station: str, channel: str, duration: float, sampling_rate: float, frequency: float) -> Stream:
    npts = int(duration * sampling_rate)
    times = [i / sampling_rate for i in range(npts)]
    data = [math.sin(2 * math.pi * frequency * t) for t in times]

    stats = {
        "network": network,
        "station": station,
        "channel": channel,
        "starttime": UTCDateTime(),
        "sampling_rate": sampling_rate,
    }

    trace = Trace(data=data, header=stats)
    return Stream([trace])
