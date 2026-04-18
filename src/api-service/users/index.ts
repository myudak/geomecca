import { API_BFF_URL } from '@src/constants/env'
import { isFrontendOnly } from '@src/constants/env'
import { frontendOnlyNoopResponse, getFrontendOnlyUserPayloadPreview, getFrontendOnlyUsers } from '@src/mocks/frontend-only'
import { AddUserPayload, UpdateUserPayload, User } from '@src/types/user'
import api from '@src/utils/api'
import { showFrontendOnlyToast } from '@src/utils/frontend-only'

import { GetAllUserListQuery } from './types'

export const getUsersAPI = async (params?: GetAllUserListQuery) => {
  if (isFrontendOnly) {
    return getFrontendOnlyUsers(params)
  }
  const { data } = await api.get<{ data: { users: User[]; total: number } }>('/user/getall', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.q && { q: params.q })
    }
  })

  return {
    data: data.data.users,
    total: data.data.total
  }
}

export const postUserAPI = async (payload: AddUserPayload) => {
  if (isFrontendOnly) {
    showFrontendOnlyToast()
    return {
      ...frontendOnlyNoopResponse,
      data: getFrontendOnlyUserPayloadPreview(payload)
    }
  }
  const { data } = await api.post('/user', payload, {
    baseURL: API_BFF_URL
  })
  return data
}

export const deleteUserAPI = async (userId: string) => {
  if (isFrontendOnly) {
    showFrontendOnlyToast()
    return {
      ...frontendOnlyNoopResponse,
      data: {
        userId
      }
    }
  }
  const { data } = await api.delete(`/user/${userId}`, {
    baseURL: API_BFF_URL
  })

  return data
}

export const putUserAPI = async (userId: string, payload: UpdateUserPayload) => {
  if (isFrontendOnly) {
    showFrontendOnlyToast()
    return {
      ...frontendOnlyNoopResponse,
      data: {
        userId,
        ...getFrontendOnlyUserPayloadPreview(payload)
      }
    }
  }
  const { data } = await api.put(`/user/${userId}`, payload, {
    baseURL: API_BFF_URL
  })
  return data
}
