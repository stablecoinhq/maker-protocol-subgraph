import { Bytes, Address, ethereum, crypto, ByteArray } from '@graphprotocol/graph-ts'
import { test, clearStore, assert } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flop/Flopper'
import { handleCage } from '../../../../../src/mappings/modules/system-stabilizer/flop'
import { tests } from '../../../../../src/mappings/modules/tests'

test('dsChief#handleEtch process event', () => {

    /**
     * 0x0000000000000000000000000000000000000000000000000000000000000020
     * 0x0000000000000000000000000000000000000000000000000000000000000003
     * 0x000000000000000000000000231d51dbec6e3e63ad22078c73b70fbfd1b14265
     * 0x000000000000000000000000e07351ecc2c326400b0ea49f1c45a94ff1b6ada8
     * 0x000000000000000000000000f71b70a4af37a8f8ab570cb77b542560d7285aec
     */
    let input = `0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000231d51dbec6e3e63ad22078c73b70fbfd1b14265000000000000000000000000e07351ecc2c326400b0ea49f1c45a94ff1b6ada8000000000000000000000000f71b70a4af37a8f8ab570cb77b542560d7285aec`
    const inputBytes = Bytes.fromHexString(input)

    const decodedYays = ethereum.decode("address[]", inputBytes)

    if (decodedYays) {
        const yays = decodedYays.toAddressArray()
        const addressList: Bytes[] = yays.map<Bytes>(
            (yay: Address) => yay as Bytes
        )

        // encode addressList to hash
        const slate = crypto.keccak256(
            ByteArray.fromHexString(inputBytes.toHexString())
        )
        console.log(`slate: ${slate.toHexString()}`)
    }
})
