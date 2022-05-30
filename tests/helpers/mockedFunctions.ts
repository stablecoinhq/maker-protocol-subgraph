import { tests } from "../../src/mappings/modules/tests";
import { Address, ethereum, BigInt, Value, Bytes } from "@graphprotocol/graph-ts";

export function mockDebt(): void{
  let debtResult = BigInt.fromString("100").toI32()
  tests.helpers.contractCalls.mockFunction(
      Address.fromString("0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b"),
      'debt',
      'debt():(uint256)',
      [],
      [ethereum.Value.fromI32(debtResult)]
    )
}

export function mockSin(era: i32): void{
  let arg1 = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(era))
  let sinResult = BigInt.fromString("100").toI32()
  tests.helpers.contractCalls.mockFunction(
    Address.fromString("0xA950524441892A31ebddF91d3cEEFa04Bf454466"),
    'sin',
    'sin(uint256):(uint256)',
    [arg1],
    [ethereum.Value.fromI32(sinResult)]
  )
}