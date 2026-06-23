import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { RootState } from '@modules/shared/store/store'

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
