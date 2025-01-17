import { Bytes, Address, BigInt } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, describe, beforeEach } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Pot/Pot'
import { handleFile } from '../../../../../src/mappings/modules/rates/pot'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockCommon } from '../../../../helpers/mockedFunctions'
mockCommon()

function strRadToBytes(value: string): Bytes {
  return Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(value)).reverse())
}

function createEventDSR(what: string, data: string): LogNote {
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

describe('Pot#handleFile', () => {
  describe("When [what] is 'dsr'", () => {
    test('Updates SystemState.savingsRate', () => {
      let what = 'dsr'
      let data = '10000000000000000000000000000' // 10 Ray

      let event = createEventDSR(what, data)

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'savingsRate', '10')

      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'contractType', "POT")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey1', what)
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterKey2', "")
      assert.fieldEquals('ProtocolParameterChangeLogBigDecimal', protocolParameterChangeLogId, 'parameterValue', "10")

      clearStore()
    })
  })

  describe("When [what] is 'vow'", () => {
    test('Updates SystemState.potVowContract', () => {
      let what = 'vow'
      let data = '0x0000b3f3d7966a1dfe207aa4514c12a259a00000'

      let event = createEventVow(what, data)

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'potVowContract', data)

      let protocolParameterChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      assert.fieldEquals('ProtocolParameterChangeLogBytes', protocolParameterChangeLogId, 'contractType', "POT")
      assert.fieldEquals('ProtocolParameterChangeLogBytes', protocolParameterChangeLogId, 'parameterKey1', what)
      assert.fieldEquals('ProtocolParameterChangeLogBytes', protocolParameterChangeLogId, 'parameterKey2', "")
      assert.fieldEquals('ProtocolParameterChangeLogBytes', protocolParameterChangeLogId, 'parameterValue', data)


      clearStore()
    })
  })
})
