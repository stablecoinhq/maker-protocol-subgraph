import { BigDecimal } from '@graphprotocol/graph-ts'
import { system as systemModule, voteLogs } from '../../../entities'
import { Bytes } from '@graphprotocol/graph-ts'
import { bytes, integer, decimal, units } from '@protofire/subgraph-toolkit'
import { LogNote } from '../../../../generated/DSChief/DSChief'

export function handleVote(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // vote(bytes32 slate)
    if (signature == '0xa69beaba') {
        voteLogs.createVoteLog(event, signature + "-" + "handleVote")
    }
}

export function handleLaunch(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // launch()
    if (signature == '0x01339c21') {
        voteLogs.createVoteLog(event, signature + "-" + "handleLaunch")
    }
}

export function handleLock(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // lock(uint wad)
    if (signature == '0xdd467064') {
        voteLogs.createVoteLog(event, signature + "-" + "handleLock")
    }
}

export function handleFree(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // free(uint wad)
    if (signature == '0xd8ccd0f3') {
        voteLogs.createVoteLog(event, signature + "-" + "handleFree")
    }
}

export function handleEtch(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // etch(address[] memory yays)
    if (signature == '0x5123e1fa') {
        voteLogs.createVoteLog(event, signature + "-" + "handleEtch")
    }
}

export function handleLift(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // vote(address[] memory yays)
    if (signature == '0x3c278bd5') {
        voteLogs.createVoteLog(event, signature + "-" + "handleLift")
    }
}
