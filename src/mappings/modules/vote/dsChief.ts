import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { vote } from '../../../entities'
import { LogNote } from '../../../../generated/DSChief/DSChief'
import { VoteLogEtch, VoteLogFree, VoteLogLaunch, VoteLogLift, VoteLogLock, VoteLogVote } from '../../../../generated/schema'

export function handleVote(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // vote(bytes32 slate)
    if (signature == '0xa69beaba') {
        let voteState = vote.getVoteState()
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
        let voteLog = new VoteLogVote(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash
        voteLog.hat = voteState.hat
        voteLog.slate = event.params.foo
        voteLog.save()
    }
}

export function handleLaunch(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // launch()
    if (signature == '0x01339c21') {
        let voteState = vote.getVoteState()
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
        let voteLog = new VoteLogLaunch(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash
        voteLog.hat = voteState.hat
        voteLog.save()
    }
}

export function handleLock(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // lock(uint wad)
    if (signature == '0xdd467064') {
        let voteState = vote.getVoteState()
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

        let voteLog = new VoteLogLock(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash
        voteLog.hat = voteState.hat
        voteLog.wad = BigInt.fromUnsignedBytes(event.params.foo)
        voteLog.save()
    }
}

export function handleFree(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // free(uint wad)
    if (signature == '0xd8ccd0f3') {
        let voteState = vote.getVoteState()
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

        let voteLog = new VoteLogFree(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash

        voteLog.hat = voteState.hat
        voteLog.wad = BigInt.fromUnsignedBytes(event.params.foo)
        voteLog.save()
    }
}

export function handleEtch(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // etch(address[] memory yays)
    if (signature == '0x5123e1fa') {
        let voteState = vote.getVoteState()
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

        const decodedYays = ethereum.decode("address[]", Bytes.fromUint8Array(event.params.fax.subarray(4)))
        if (decodedYays) {
            const yays = decodedYays.toAddressArray()
            let voteLog = new VoteLogEtch(id)
            voteLog.block = event.block.number
            voteLog.timestamp = event.block.timestamp
            voteLog.transaction = event.transaction.hash

            voteLog.hat = voteState.hat
            if (yays) {
                voteLog.yays = yays.map<Bytes>((yay: Address) => Bytes.fromHexString(yay.toHexString()))
                voteLog.save()
            }
        }
    }
}

export function handleLift(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // lift(address whom)
    if (signature == '0x3c278bd5') {
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
        const decodedAddress = ethereum.decode("address", Bytes.fromUint8Array(event.params.fax.subarray(4)))
        if (decodedAddress) {
            const whom = decodedAddress.toAddress()
            // set hat
            let voteState = vote.getVoteState()
            voteState.hat = whom
            voteState.save()

            let voteLog = new VoteLogLift(id)
            voteLog.block = event.block.number
            voteLog.timestamp = event.block.timestamp
            voteLog.transaction = event.transaction.hash

            voteLog.hat = voteState.hat
            voteLog.save()
        }
    }
}
