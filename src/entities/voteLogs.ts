import { VoteLog } from '../../generated/schema'
import { BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'

export namespace voteLogs {
    export function createVoteLog(event: ethereum.Event, msg: string): void {
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
        let voteLog = new VoteLog(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash
        voteLog.msg = Bytes.fromUTF8(msg)
        voteLog.save()
    }
}
