import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { test, assert, clearStore } from 'matchstick-as'
import { tests } from '../../../../../src/mappings/modules/tests'
import { LogNote } from '../../../../../generated/Flap/Flapper'
import { handleYank } from '../../../../../src/mappings/modules/system-stabilizer/flap'
import { system as systemModule } from '../../../../../src/entities'
import { mockCommon } from '../../../../helpers/mockedFunctions'
mockCommon()

function createEvent(id: BigInt): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0x26e027f1'))
  let usr = tests.helpers.params.getBytes('usr', Bytes.fromUTF8(''))

  let radBytes = Bytes.fromUint8Array(Bytes.fromBigInt(id).reverse())
  let arg1 = tests.helpers.params.getBytes('arg2', radBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, usr, arg1]))

  return event
}

test('Flapper#handleYank: Sets active to false', () => {
  let id = BigInt.fromString('50')

  let auctionId = id
    .toString()
    .concat('-')
    .concat('surplus')

  let event = createEvent(id)

  let system = systemModule.getSystemState(event)
  system.save()
  handleYank(event)

  assert.fieldEquals('SurplusAuction', auctionId, 'active', 'false')
  assert.fieldEquals('SurplusAuction', auctionId, 'deletedAt', event.block.timestamp.toString())
  clearStore()
})
