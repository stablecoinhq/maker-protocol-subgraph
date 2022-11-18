import { Address, BigInt, Bytes, ethereum, crypto, ByteArray } from '@graphprotocol/graph-ts'
import { users, system as systemModule, votes } from '../../../entities'
import { Etch, LogNote } from '../../../../generated/DSChief/DSChief'
import { VoteApproval, VoteLogEtch, VoteLogFree, VoteLogLaunch, VoteLogLift, VoteLogLock, VoteLogVote, VoteSlate } from '../../../../generated/schema'

export function handleLaunch(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // launch()
    if (signature == '0x01339c21') {
        let systemState = systemModule.getSystemState(event)
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
        let voteLog = new VoteLogLaunch(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash
        if (systemState.hat != null) {
            voteLog.hat = systemState.hat
        }
        voteLog.save()
    }
}

export function handleLock(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // lock(uint wad)
    if (signature == '0xdd467064') {
        let systemState = systemModule.getSystemState(event)
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

        let voteLog = new VoteLogLock(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash
        if (systemState.hat != null) {
            voteLog.hat = systemState.hat
        }
        voteLog.sender = event.transaction.from
        const wad = ethereum.decode("uint256", event.params.foo)
        if (wad) {
            voteLog.wad = wad.toBigInt()
            voteLog.save()
            const user = users.getOrCreateUser(event.transaction.from)
            user.voteWeight = user.voteWeight.plus(wad.toBigInt())
            if (user.voteSlate) {
                const voteSlate = votes.loadOrCreateVoteSlate(user.voteSlate)
                for (let i = 0; i < voteSlate.addresses.length; i++) {
                    const address = voteSlate.addresses[i]
                    const voteApproval = votes.loadOrCreateVoteApproval(address.toHexString())
                    voteApproval.approvals = voteApproval.approvals.plus(wad.toBigInt())
                    voteApproval.save()
                }
            }
            user.save()
        }
    }
}

export function handleFree(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // free(uint wad)
    if (signature == '0xd8ccd0f3') {
        let systemState = systemModule.getSystemState(event)
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

        let voteLog = new VoteLogFree(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash

        if (systemState.hat != null) {
            voteLog.hat = systemState.hat
        }
        voteLog.sender = event.transaction.from
        const wad = ethereum.decode("uint256", event.params.foo)
        if (wad) {
            voteLog.wad = wad.toBigInt()
            voteLog.save()

            const user = users.getOrCreateUser(event.transaction.from)
            const weight = (user.voteWeight ? user.voteWeight : BigInt.fromI32(0))
            user.voteWeight = weight.minus(wad.toBigInt())
            if (user.voteSlate) {
                const voteSlate = votes.loadOrCreateVoteSlate(user.voteSlate)
                for (let i = 0; i < voteSlate.addresses.length; i++) {
                    const address = voteSlate.addresses[i]
                    const voteApproval = votes.loadOrCreateVoteApproval(address.toHexString())
                    voteApproval.approvals = voteApproval.approvals.minus(wad.toBigInt())
                    voteApproval.save()
                }
                voteSlate.save()
            }
            user.save()
        }
    }
}

export function handleEtch(event: LogNote): Bytes {
    let signature = event.params.sig.toHexString()
    // etch(address[] memory yays)
    // if (signature == '0x5123e1fa') {
    const oldId = event.transaction.hash.toHex() + '-' + (event.logIndex.minus(BigInt.fromI32(1))).toString()
    let oldVoteLog = VoteLogEtch.load(oldId)
    if (oldVoteLog == null) {
        let systemState = systemModule.getSystemState(event)
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
        let voteLog = new VoteLogEtch(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash
        // voteLog.sender = event.transaction.from
        voteLog.sender = Bytes.fromUint8Array(event.params.fax.subarray(4))
        voteLog.hat = systemState.hat

        const decodedYays = ethereum.decode("address[]", Bytes.fromUint8Array(event.params.fax.subarray(4)))
        if (decodedYays) {
            const yays = decodedYays.toAddressArray()
            const addressList: Bytes[] = yays.map<Bytes>(
                (yay: Address) => yay as Bytes
            )
            voteLog.yays = addressList
            voteLog.save()

            // encode addressList to hash
            const slate = crypto.keccak256(
                ByteArray.fromHexString(Bytes.fromUint8Array(event.params.fax.subarray(4)).toHexString())
            )
            const voteSlate = votes.loadOrCreateVoteSlate(slate.toHexString())
            voteSlate.slate = Bytes.fromByteArray(slate)
            voteSlate.addresses = addressList
            voteSlate.save()

            return Bytes.fromByteArray(slate)
        } else {
            // decode failure, should not be here
            return new Bytes(0)
        }
        // }
    } else {
        // old log already exists, do nothing
        return new Bytes(0)
    }
}

function handleVoteWithSlate(event: LogNote, slateArg: Bytes | null): void {

    const oldId = event.transaction.hash.toHex() + '-' + (event.logIndex.minus(BigInt.fromI32(1))).toString()
    let oldVoteLog = VoteLogVote.load(oldId)
    if (oldVoteLog == null) {

        let signature = event.params.sig.toHexString()
        // vote(bytes32 slate)
        // if (signature == '0xa69beaba') {
        let systemState = systemModule.getSystemState(event)
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
        let voteLog = new VoteLogVote(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash
        voteLog.hat = systemState.hat
        voteLog.sender = event.transaction.from

        const slateEthValue = ethereum.decode("bytes", event.params.foo)
        let slate: Bytes | null = slateArg ? slateArg : (slateEthValue ? slateEthValue.toBytes() : null)
        if (slate) {
            voteLog.slate = slate
            voteLog.save()

            // move user vote weight from old slate to new slate
            const user = users.getOrCreateUser(event.transaction.from)
            if (user.voteWeight.gt(BigInt.fromString("0"))) {
                const oldVoteSlate = votes.loadOrCreateVoteSlate(user.voteSlate)
                for (let i = 0; i < oldVoteSlate.addresses.length; i++) {
                    const address = oldVoteSlate.addresses[i]
                    const voteApproval = votes.loadOrCreateVoteApproval(address.toHexString())
                    voteApproval.approvals = voteApproval.approvals.minus(user.voteWeight)
                    voteApproval.save()
                }
                user.voteSlate = slate.toHexString()
                const newVoteSlate = votes.loadOrCreateVoteSlate(user.voteSlate)
                for (let i = 0; i < newVoteSlate.addresses.length; i++) {
                    const address = newVoteSlate.addresses[i]
                    const voteApproval = votes.loadOrCreateVoteApproval(address.toHexString())
                    voteApproval.approvals = voteApproval.approvals.plus(user.voteWeight)
                    voteApproval.save()
                }
            }
        }
        // }
    }
}

export function handleVote(event: LogNote): void {
    handleVoteWithSlate(event, null)
}

export function handleEtchAndVote(event: LogNote): void {
    const slate: Bytes = handleEtch(event)
    handleVoteWithSlate(event, slate)
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
            let systemState = systemModule.getSystemState(event)
            // create or load VoteApproval
            const voteApproval = votes.loadOrCreateVoteApproval(whom.toHexString())
            voteApproval.save()
            systemState.hat = whom.toHexString()
            systemState.save()

            let voteLog = new VoteLogLift(id)
            voteLog.block = event.block.number
            voteLog.timestamp = event.block.timestamp
            voteLog.transaction = event.transaction.hash

            if (systemState.hat != null) {
                voteLog.hat = systemState.hat
            }
            voteLog.sender = event.transaction.from
            voteLog.save()
        }
    }
}
