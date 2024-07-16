import { describe, it, expect, beforeEach } from 'vitest';
import BillingCalculator from './calculator';

describe('BillingCalculator', () => {
    let calculator;

    beforeEach(() => {
        calculator = new BillingCalculator();
    });

    it('คำนวณส่วนลดทั้งหมดเป็นเปอร์เซ็นต์', () => {
        const total = 100;
        const discount = '10%';
        const expectedDiscountValue = 10;
        const discountValue = calculator.calculateTotalDiscount(total, discount);
        expect(discountValue).toBe(expectedDiscountValue, `คาดว่ามูลค่าส่วนลดจะเป็น ${expectedDiscountValue} แต่ได้ ${discountValue}`);
    });

    it('คำนวณส่วนลดทั้งหมดเป็นค่าคงที่', () => {
        const total = 100;
        const discount = '10';
        const expectedDiscountValue = 10;
        const discountValue = calculator.calculateTotalDiscount(total, discount);
        expect(discountValue).toBe(expectedDiscountValue, `คาดว่ามูลค่าส่วนลดจะเป็น ${expectedDiscountValue} แต่ได้ ${discountValue}`);
    });

    it('คำนวณยอดรวมก่อน VAT สำหรับประเภท VAT 2', () => {
        const total = 120;
        const vatRate = 20;
        const vatType = 2;
        const totalBeforeVat = calculator.calculateTotalBeforeVat(total, vatRate, vatType);
        expect(totalBeforeVat).toBeCloseTo(100, 2, `คาดว่ายอดรวมก่อน VAT จะเป็นประมาณ 100 แต่ได้ ${totalBeforeVat}`);
    });

    it('คำนวณมูลค่า VAT รวมสำหรับประเภท VAT 1', () => {
        const totalValue = 120;
        const totalBeforeVat = 100;
        const vatRate = 20;
        const vatType = 1;
        const vatValue = calculator.calculateTotalVatValue(totalValue, totalBeforeVat, vatRate, vatType);
        expect(vatValue).toBe(20, `คาดว่ามูลค่า VAT จะเป็น 20 แต่ได้ ${vatValue}`);
    });

    it('คำนวณมูลค่า VAT รวมสำหรับประเภท VAT 2', () => {
        const totalValue = 120;
        const totalBeforeVat = 0;
        const vatRate = 20;
        const vatType = 2;
        const vatValue = calculator.calculateTotalVatValue(totalValue, totalBeforeVat, vatRate, vatType);
        expect(vatValue).toBeCloseTo(20, 2, `คาดว่ามูลค่า VAT จะเป็นประมาณ 20 แต่ได้ ${vatValue}`);
    });

    it('คำนวณยอดรวมหลัง VAT', () => {
        const totalBeforeVat = 100;
        const totalVatValue = 20;
        const totalAfterVat = calculator.calculateTotalAfterVat(totalBeforeVat, totalVatValue);
        expect(totalAfterVat).toBe(120, `คาดว่ายอดรวมหลัง VAT จะเป็น 120 แต่ได้ ${totalAfterVat}`);
    });

    it('คำนวณยอดรวมทั้งหมดสำหรับประเภท VAT 1', () => {
        const totalValue = 120;
        const totalAfterVat = 120;
        const totalExceptVat = 0;
        const vatType = 1;
        const totalAmount = calculator.calculateTotalAmount(totalValue, totalAfterVat, totalExceptVat, vatType);
        expect(totalAmount).toBe(120, `คาดว่ายอดรวมทั้งหมดจะเป็น 120 แต่ได้ ${totalAmount}`);
    });

    it('คำนวณยอดรวมทั้งหมดสำหรับประเภท VAT 3', () => {
        const totalValue = 120;
        const totalAfterVat = 0;
        const totalExceptVat = 0;
        const vatType = 3;
        const totalAmount = calculator.calculateTotalAmount(totalValue, totalAfterVat, totalExceptVat, vatType);
        expect(totalAmount).toBe(120, `คาดว่ายอดรวมทั้งหมดจะเป็น 120 แต่ได้ ${totalAmount}`);
    });
});
