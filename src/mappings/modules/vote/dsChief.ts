import { BigDecimal } from '@graphprotocol/graph-ts'
import { LogNote } from '../../../../generated/DSChief/DSChief'
import { system as systemModule } from '../../../entities'
import { Bytes } from '@graphprotocol/graph-ts'
import { bytes, integer, decimal, units } from '@protofire/subgraph-toolkit'

export function handleVote(event: LogNote): void {
    let signature = event.params.sig.toHexString()
    let system = systemModule.getSystemState(event)
    event

    // vote(address[] yays)
    // https://github.com/dapphub/ds-chief/blob/master/src/chief.sol#L83-L89
    if (signature == '0xed081329') {
        // should parse address[] yays from event.parameters.dataStart or something
        // log vote action
    }
}
