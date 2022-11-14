import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { system as systemModule, voteLogs } from '../../../entities'
import { Bytes } from '@graphprotocol/graph-ts'
import { bytes, integer, decimal, units } from '@protofire/subgraph-toolkit'
import { LogNote } from '../../../../generated/DSPause/DSPause'
import { decodeTuple } from '../../../utils'

export function handleSetDelay(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // setDelay(uint delay_)
    if (signature == '0xe177246e') {
        voteLogs.createVoteLog(event, signature + "-" + "handleSetDelay")
        const delay_ = BigInt.fromUnsignedBytes(event.params.foo)
    }
}

export function handlePlot(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // plot(address usr, bytes32 tag, bytes memory fax, uint eta)
    if (signature == '0x46d2fbbb') {
        voteLogs.createVoteLog(event, signature + "-" + "handlePlot")
        const decodedParams = decodeTuple("(address,bytes32,bytes, uint256)", event.params.fax)
        if (decodedParams) {
            const usr = decodedParams[0].toAddress()
            const tag = decodedParams[1].toBytes()
            const fax = decodedParams[2].toBytes()
            const eta = decodedParams[3].toBigInt()
        }
    }
}

export function handleDrop(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // drop(address usr, bytes32 tag, bytes memory fax, uint eta)
    if (signature == '0x162c7de3') {
        voteLogs.createVoteLog(event, signature + "-" + "handleDrop")
        const decodedParams = decodeTuple("(address,bytes32,bytes, uint256)", event.params.fax)
        if (decodedParams) {
            const usr = decodedParams[0].toAddress()
            const tag = decodedParams[1].toBytes()
            const fax = decodedParams[2].toBytes()
            const eta = decodedParams[3].toBigInt()
        }
    }
}

export function handleExec(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    // exec(address usr, bytes32 tag, bytes memory fax, uint eta)
    if (signature == '0x168ccd67') {
        voteLogs.createVoteLog(event, signature + "-" + "handleExec")
        const decodedParams = decodeTuple("(address,bytes32,bytes, uint256)", event.params.fax)
        if (decodedParams) {
            const usr = decodedParams[0].toAddress()
            const tag = decodedParams[1].toBytes()
            const fax = decodedParams[2].toBytes()
            const eta = decodedParams[3].toBigInt()
        }
    }
}
