import { Bytes, Address, BigInt } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, describe, beforeEach } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Jug/Jug'
import { handleFile } from '../../../../../src/mappings/modules/rates/jug'
import { tests } from '../../../../../src/mappings/modules/tests'
import { collateralTypes } from '../../../../../src/entities/collateralTypes'
import { mockCommon } from '../../../../helpers/mockedFunctions'
mockCommon()

function strRadToBytes(value: string): Bytes {
  return Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(value)).reverse())
}

function createEventBase(what: string, data: string): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0x29ae8114'))
  let usr = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(''))
  let dataBytes = strRadToBytes(data)
  let arg1 = tests.helpers.params.getBytes('arg2', Bytes.fromUTF8(what))
  let arg2 = tests.helpers.params.getBytes('arg3', dataBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, usr, arg1, arg2]))

  return event
}

function createEventVow(what: string, data: string): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0xd4e8be83'))
  let usr = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(''))
  let dataBytes = Address.fromString(data)
  let arg1 = tests.helpers.params.getBytes('arg2', Bytes.fromUTF8(what))
  let arg2 = tests.helpers.params.getBytes('arg3', dataBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, usr, arg1, arg2]))

  return event
}

function createEventIlk(ilk: string, what: string, data: string): LogNote {
  let ilkBytes = Bytes.fromUTF8(ilk)
  let whatBytes = Bytes.fromUTF8(what)
  let sigBytes = Bytes.fromHexString('0x1a0b287e')

  let sig = tests.helpers.params.getBytes('sig', sigBytes)
  let usr = tests.helpers.params.getBytes('usr', Bytes.fromUTF8(''))
  let arg1 = tests.helpers.params.getBytes('arg1', ilkBytes)
  let arg2 = tests.helpers.params.getBytes('arg2', whatBytes)
  let dataParam = tests.helpers.params.getBytes('data', Bytes.fromHexString(data))

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, usr, arg1, arg2, dataParam]))
  return event
}

describe('Jug#handleFile', () => {
  describe("When [what] is 'base'", () => {
    test('Updates SystemState.baseStabilityFee', () => {
      let what = 'base'
      let data = '10000000000000000000000000000' // 10 Ray

      let event = createEventBase(what, data)

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'baseStabilityFee', '10')
      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey1', what)
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey2', "")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterValue', "10")

      clearStore()
    })
  })

  describe("When [what] is 'vow'", () => {
    test('Updates SystemState.vowContract', () => {
      let what = 'vow'
      let data = '0x0000b3f3d7966a1dfe207aa4514c12a259a00000'

      let event = createEventVow(what, data)

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'jugVowContract', data)
      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.fieldEquals('ProtocolParameterChangeLogBytes', protocolParameterChangeLogId, 'contractType', "JUG")
      assert.fieldEquals('ProtocolParameterChangeLogBytes', protocolParameterChangeLogId, 'parameterKey1', what)
      assert.fieldEquals('ProtocolParameterChangeLogBytes', protocolParameterChangeLogId, 'parameterKey2', "")
      assert.fieldEquals('ProtocolParameterChangeLogBytes', protocolParameterChangeLogId, 'parameterValue', data)

      clearStore()
    })
  })

  describe("When [what] is 'duty'", () => {
    test('Updates CollateralType.stabilityFee', () => {
      let ilk = '5257413030312d410000'
      let what = 'duty'
      let dataBytes =
        (new Bytes(4)) // sig
          .concat(new Bytes(32)) // arg1
          .concat(new Bytes(32)) // arg2
          .concat(strRadToBytes("1000000000937303470807876289"))
          .toHexString()

      let event = createEventIlk(ilk, what, dataBytes)

      // create de collateralstype to test
      let collateral = collateralTypes.loadOrCreateCollateralType(ilk)
      collateral.save()

      handleFile(event)

      assert.fieldEquals('CollateralType', ilk, 'stabilityFee', '1.000000000937303470807876289')
      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'contractType', "JUG")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey1', what)
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey2', ilk)
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterValue', "1.000000000937303470807876289")

      clearStore()
    })
  })
})
