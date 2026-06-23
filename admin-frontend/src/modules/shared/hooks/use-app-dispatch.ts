import { useDispatch } from 'react-redux'
import { AppDispatch } from '@modules/shared/store/store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
