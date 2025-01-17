import { test, assert, clearStore, describe, beforeAll, beforeEach } from 'matchstick-as'
import { tests } from '../../../../../src/mappings/modules/tests'
import { File as FileBigIntEvent } from '../../../../../generated/ClipperEth/Clipper'
import { handleFile1 } from '../../../../../src/mappings/modules/liquidation/clipper'
import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { SystemState } from '../../../../../generated/schema'
import { decimal, integer } from '@protofire/subgraph-toolkit'
import { mockCommon } from '../../../../helpers/mockedFunctions'
mockCommon()

function createEvent(what: string, data: BigInt): FileBigIntEvent {
  return changetype<FileBigIntEvent>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getBytes('what', Bytes.fromUTF8(what)),
      tests.helpers.params.getBigInt('data', data),
    ]),
  )
}

let systemState: SystemState

describe('Clipper#handleFile1', () => {
  beforeAll(() => {
    clearStore()
  })

  beforeEach(() => {
    systemState = new SystemState('current')
    systemState.saleAuctionStartingPriceFactor = decimal.ONE
    systemState.saleAuctionResetTime = integer.ZERO
    systemState.saleAuctionDropPercentage = decimal.ZERO
    systemState.saleAuctionDaiToRaisePercentage = decimal.ZERO
    systemState.saleAuctionFlatFee = decimal.ZERO
    systemState.save()
  })

  describe('when [what]=empty', () => {
    test('does not update anything', () => {
      let what = ''
      let data = BigInt.fromString('5000000000000000000000000000') // 5 ray
      let event = createEvent(what, data)

      handleFile1(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionStartingPriceFactor', '1')
      assert.fieldEquals('SystemState', 'current', 'saleAuctionResetTime', '0')
      assert.fieldEquals('SystemState', 'current', 'saleAuctionDropPercentage', '0')
      assert.fieldEquals('SystemState', 'current', 'saleAuctionDaiToRaisePercentage', '0')
      assert.fieldEquals('SystemState', 'current', 'saleAuctionFlatFee', '0')

      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.notInStore('ProtocolParameterChangeLog', protocolParameterChangeLogId)
    })
  })

  describe('when [what]=buf', () => {
    test('updates saleAuctionStartingPriceFactor', () => {
      let what = 'buf'
      let data = BigInt.fromString('5000000000000000000000000000') // 5 ray
      let event = createEvent(what, data)

      handleFile1(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionStartingPriceFactor', '5')

      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'contractType', "CLIPPER")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey1', what)
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey2', "")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterValue', "5")
    })
  })

  describe('when [what]=tail', () => {
    test('updates saleAuctionResetTime', () => {
      let what = 'tail'
      let data = BigInt.fromString('60') // seconds
      let event = createEvent(what, data)

      handleFile1(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionResetTime', '60')
      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.fieldEquals('ProtocolParameterChangeLogBigInt', protocolParameterChangeLogId, 'contractType', "CLIPPER")
      assert.fieldEquals('ProtocolParameterChangeLogBigInt', protocolParameterChangeLogId, 'parameterKey1', what)
      assert.fieldEquals('ProtocolParameterChangeLogBigInt', protocolParameterChangeLogId, 'parameterKey2', "")
      assert.fieldEquals('ProtocolParameterChangeLogBigInt', protocolParameterChangeLogId, 'parameterValue', "60")
    })
  })

  describe('when [what]=cusp', () => {
    test('updates saleAuctionDropPercentage', () => {
      let what = 'cusp'
      let data = BigInt.fromString('50000000000000000000000000000') // 50 ray
      let event = createEvent(what, data)

      handleFile1(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionDropPercentage', '50')
      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'contractType', "CLIPPER")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey1', what)
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey2', "")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterValue', "50")
    })
  })

  describe('when [what]=chip', () => {
    test('updates saleAuctionDaiToRaisePercentage', () => {
      let what = 'chip'
      let data = BigInt.fromString('1500000000000000000') // 1.5 wad
      let event = createEvent(what, data)

      handleFile1(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionDaiToRaisePercentage', '1.5')
      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'contractType', "CLIPPER")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey1', what)
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey2', "")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterValue', "1.5")
    })
  })

  describe('when [what]=tip', () => {
    test('updates saleAuctionFlatFee', () => {
      let what = 'tip'
      let data = BigInt.fromString('2500000000000000000000000000000000000000000000') // 2.5 rad
      let event = createEvent(what, data)

      handleFile1(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionFlatFee', '2.5')
      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'contractType', "CLIPPER")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey1', what)
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey2', "")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterValue', "2.5")
    })
  })
})
