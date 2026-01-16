import { Landmark } from '../types'

// 例えば「指が立っているか」を判定するロジック
export const isFingerRaised = (tip: Landmark, base: Landmark) => {
  return tip.y < base.y; // Y座標がベースより上（数値が小さい）なら立っている
}