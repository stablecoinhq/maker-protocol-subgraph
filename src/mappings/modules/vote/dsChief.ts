import { Address, BigInt, Bytes, ethereum, crypto, ByteArray } from '@graphprotocol/graph-ts'
import { users, system as systemModule } from '../../../entities'
import { LogNote } from '../../../../generated/DSChief/DSChief'
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
                const voteSlate = VoteSlate.load(user.voteSlate)
                if (voteSlate) {
                    for (let i = 0; i < voteSlate.addresses.length; i++) {
                        const address = voteSlate.addresses[i]
                        const voteApproval = new VoteApproval(address.toHexString())
                        voteApproval.approvals = voteApproval.approvals.plus(wad.toBigInt())
                        voteApproval.save()
                    }
                    voteSlate.save()
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
                const voteSlate = new VoteSlate(user.voteSlate)
                for (let i = 0; i < voteSlate.addresses.length; i++) {
                    const address = voteSlate.addresses[i]
                    const voteApproval = new VoteApproval(address.toHexString())
                    voteApproval.approvals = voteApproval.approvals.minus(wad.toBigInt())
                    voteApproval.save()
                }
                voteSlate.save()
            }
            user.save()
        }
    }
}

export function handleEtch(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // etch(address[] memory yays)
    if (signature == '0x5123e1fa') {
        let systemState = systemModule.getSystemState(event)
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

        const decodedYays = ethereum.decode("address[]", Bytes.fromUint8Array(event.params.fax.subarray(4)))
        if (decodedYays) {
            const yays = decodedYays.toAddressArray()
            let voteLog = new VoteLogEtch(id)
            voteLog.block = event.block.number
            voteLog.timestamp = event.block.timestamp
            voteLog.transaction = event.transaction.hash

            if (systemState.hat != null) {
                voteLog.hat = systemState.hat
            }
            voteLog.sender = event.transaction.from
            if (yays) {
                const addressList: Bytes[] = yays.map<Bytes>(
                    (yay: Address) => Bytes.fromHexString(yay.toHexString())
                )
                voteLog.yays = addressList
                voteLog.save()

                // encode addressList to hash
                const byteArray = ByteArray.fromHexString(event.params.fax.subarray(4).toString())
                const hashId = crypto.keccak256(byteArray).toHexString()
                const voteSlate = new VoteSlate(hashId)
                voteSlate.addresses = addressList
                voteSlate.save()
            }
        }
    }
}

export function handleVote(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // vote(bytes32 slate)
    if (signature == '0xa69beaba') {
        let systemState = systemModule.getSystemState(event)
        const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
        let voteLog = new VoteLogVote(id)
        voteLog.block = event.block.number
        voteLog.timestamp = event.block.timestamp
        voteLog.transaction = event.transaction.hash
        if (systemState.hat != null) {
            voteLog.hat = systemState.hat
        }
        voteLog.sender = event.transaction.from
        const slate = ethereum.decode("bytes", event.params.foo)
        if (slate) {
            voteLog.slate = slate.toBytes()
            voteLog.save()

            // move user vote weight from old slate to new slate
            const user = users.getOrCreateUser(event.transaction.from)
            if (user.voteWeight.gt(BigInt.fromString("0"))) {
                if (user.voteSlate != null) {
                    const oldVoteSlate = new VoteSlate(user.voteSlate)
                    for (let i = 0; i < oldVoteSlate.addresses.length; i++) {
                        const address = oldVoteSlate.addresses[i]
                        const voteApproval = new VoteApproval(address.toHexString())
                        voteApproval.approvals = voteApproval.approvals.minus(user.voteWeight)
                        voteApproval.save()
                    }
                }
                user.voteSlate = slate.toString()
                const newVoteSlate = new VoteSlate(slate.toString())
                for (let i = 0; i < newVoteSlate.addresses.length; i++) {
                    const address = newVoteSlate.addresses[i]
                    const voteApproval = new VoteApproval(address.toHexString())
                    voteApproval.approvals = voteApproval.approvals.plus(user.voteWeight)
                    voteApproval.save()
                }
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
            let systemState = systemModule.getSystemState(event)
            // create or load VoteApproval
            const voteApproval = new VoteApproval(whom.toHexString())
            systemState.hat = voteApproval.id
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
