import { Bytes, Address, BigInt, log } from '@graphprotocol/graph-ts'
import { test, clearStore, assert } from 'matchstick-as'
import { LogNote } from '../../../../../generated/DSChief/DSChief'
import { handleFree } from '../../../../../src/mappings/modules/vote/dsChief'
import { tests } from '../../../../../src/mappings/modules/tests'
import { system as systemModule, users, votes } from '../../../../../src/entities'

function strRadToBytes(value: string): Bytes {
    const byteArray = Bytes.fromBigInt(BigInt.fromString(value))
    const filledArray = new Uint8Array(32)
    for (let byteArrayIndex = 0; byteArrayIndex < Math.min(31, byteArray.length); byteArrayIndex++) {
        filledArray[byteArrayIndex] = byteArray[byteArrayIndex]
    }
    return Bytes.fromUint8Array(filledArray.reverse())
}

test('dsChief#handleFree process event in case user does not have slate', () => {
    const voteWeight = "10000";

    const sig = Bytes.fromHexString("0xd8ccd0f3")
    const guy = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
    const wad = "0"
    const foo = strRadToBytes(voteWeight)
    // log.info("val: {}, {}", [foo.toHexString(), foo.length.toString()])
    const bar = new Bytes(32)
    const fax = sig.concat(foo).concat(bar)

    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
        tests.helpers.params.getBytes('sig', sig),
        tests.helpers.params.getAddress('guy', Address.fromString(guy)),
        tests.helpers.params.getBytes('foo', foo),
        tests.helpers.params.getBytes('bar', bar),
        tests.helpers.params.getBigInt('wad', BigInt.fromString(wad)),
        tests.helpers.params.getBytes('fax', fax),
    ]))

    // prepare system
    let system = systemModule.getSystemState(event)
    const hat = "0x000"
    system.hat = hat
    system.save()

    // prepare user
    const userId = event.transaction.from.toHexString()
    const user = users.getOrCreateUser(event.transaction.from)
    user.voteWeight = BigInt.fromString(voteWeight);
    user.save()

    handleFree(event)

    const voteLogFreeId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    const voteApprovalId = event.transaction.from.toHexString()

    assert.fieldEquals('VoteLogFree', voteLogFreeId, 'hat', hat)
    assert.fieldEquals('User', userId, 'voteWeight', "0")
    assert.notInStore("VoteApproval", voteApprovalId)
    clearStore()
})


test('dsChief#handleFree process event in case user has slate', () => {
    const voteWeight = "10000";
    const approvals = voteWeight

    const sig = Bytes.fromHexString("0xd8ccd0f3")
    const guy = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
    const wad = "0"
    const foo = strRadToBytes(voteWeight)
    const bar = new Bytes(32)
    const fax = sig.concat(foo).concat(bar)

    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
        tests.helpers.params.getBytes('sig', sig),
        tests.helpers.params.getAddress('guy', Address.fromString(guy)),
        tests.helpers.params.getBytes('foo', foo),
        tests.helpers.params.getBytes('bar', bar),
        tests.helpers.params.getBigInt('wad', BigInt.fromString(wad)),
        tests.helpers.params.getBytes('fax', fax),
    ]))

    // prepare system hat
    let system = systemModule.getSystemState(event)
    const hat = "0x000"
    system.hat = hat
    system.save()

    // prepare slate
    const voteSlateId = "0x818fdbc388be4c94f5966634dc9271db7f9c75cd1ea999a0a59f0cfb96087463"
    const voteSlate = votes.loadOrCreateVoteSlate(voteSlateId)
    voteSlate.addresses = [
        Bytes.fromHexString("0x231d51dbeC6E3E63Ad22078C73B70fBfD1b14265"),
        Bytes.fromHexString("0x33828c8c03c0975669d358297ad1e7413da8bf3e"),
        Bytes.fromHexString("0xdafa56dde6a66dc1bb2418ee7bf9087e8daf16f3"),
        Bytes.fromHexString("0xf71b70a4af37a8f8ab570cb77b542560d7285aec"),
    ]
    voteSlate.save()

    // prepare user
    const user = users.getOrCreateUser(event.transaction.from)
    user.voteSlate = voteSlateId
    user.voteWeight = BigInt.fromString(voteWeight);
    user.save()

    // prepare approvals
    voteSlate.addresses.map<boolean>((address: Bytes) => {
        const voteApproval = votes.loadOrCreateVoteApproval(address.toHexString())
        voteApproval.approvals = BigInt.fromString(voteWeight)
        voteApproval.save()
        return true;
    })

    // run handler
    handleFree(event)

    const voteLogFreeId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    const userId = event.transaction.from.toHexString()

    // assert VoteLogFree is added
    assert.fieldEquals('VoteLogFree', voteLogFreeId, 'hat', hat)
    assert.fieldEquals('User', userId, 'voteWeight', "0")

    // assert VoteApproval is added
    voteSlate.addresses.map<boolean>((address: Bytes) => {
        assert.fieldEquals('VoteApproval', address.toHexString(), 'approvals', "0")
        return true;
    })
    clearStore()
})
