import { useQuery } from '@tanstack/vue-query'
import Cookies from 'js-cookie'

import { isFrontendOnly } from '../constants/env'
import { frontendOnlyProfileResponse } from '../mocks/frontend-only'
import { APIResponse } from '../types/api'
import { User } from '../types/user'
import api from '../utils/api'

const COOKIE_ACCESS_TOKEN_KEY = 'access_token'

const useGetProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<User | null> => {
      if (isFrontendOnly) {
        const token = Cookies.get(COOKIE_ACCESS_TOKEN_KEY)
        return token ? frontendOnlyProfileResponse.data! : null
      }
      const { data } = await api.get<APIResponse<User>>('/user/me')
      return data.data!
    }
  })

export default useGetProfile
