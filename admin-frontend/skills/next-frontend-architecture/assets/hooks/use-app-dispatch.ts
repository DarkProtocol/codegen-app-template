import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@modules/shared/store/store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
