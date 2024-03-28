import "reflect-metadata";
import {ValidationError, validate} from "class-validator";
import {GetCodeDto} from "./dtos"

describe('GetCodeDto', () => {
    it.each`
        phone
        ${'+79393803616'}
        ${'89393803616'}
        ${'79393803616'}
    `('должен пропустить $phone', ({phone}) => {
        const getCodeDto = new GetCodeDto();
        getCodeDto.phone = phone;

        expect(validate(getCodeDto)).resolves.toEqual([])
    })

    it.each`
        phone
        ${'+7 939 380 36 16'}
        ${'8939380361'}
    `('должен не пропускать $phone', ({phone}) => {
        const getCodeDto = new GetCodeDto();
        getCodeDto.phone = phone;

        expect(validate(getCodeDto)).resolves.toEqual([expect.any(ValidationError)])
    })
})