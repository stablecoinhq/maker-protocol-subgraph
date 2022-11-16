import { Address, Bytes } from '@graphprotocol/graph-ts'
import { VoteState } from '../../generated/schema'

export namespace vote {
  export function getVoteState(): VoteState {
    let state = VoteState.load("current")
    if (state == null) {
      state = new VoteState('current')
      state.hat = new Bytes(0)
      state.save()
    }
    return state as VoteState
  }
}
