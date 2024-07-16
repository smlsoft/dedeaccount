class BillingCalculator {
    constructor() {
        this.totalValue = 0;
        this.vatRate = 0;
        this.vatType = 0;
        this.discount = 0;
        this.totalBeforeVat = 0;
        this.discountValue = 0;
        this.totalVatValue = 0;
    }

    calculateTotalDiscount(total, discount) {
        if (!discount) return 0;

        const discountPercentIndex = discount.indexOf('%');
        if (discountPercentIndex > 0) {
            this.discount = parseFloat(discount.substring(0, discountPercentIndex));
            this.discountValue = (total * this.discount) / 100;
        } else {
            this.discount = parseFloat(discount);
            this.discountValue = this.discount;
        }
        return this.discountValue;
    }

    calculateTotalBeforeVat(total, vatRate, vatType) {
        this.totalBeforeVat = total;

        if (vatType === 2) {
            this.totalBeforeVat -= this.calculateTotalVatValue(total, 0, vatRate, 2);
        } else if (vatType === 3 || vatType === 4) {
            this.totalBeforeVat = 0;
        }

        return this.totalBeforeVat;
    }

    calculateTotalVatValue(totalValue, totalBeforeVat, vatRate, vatType) {

        if (vatType === 1) {
            this.totalVatValue = (totalBeforeVat * vatRate) / 100;
        } else if (vatType === 2) {
            console.log('totalValue', totalValue);
            console.log('vatRate', vatRate);



            this.totalVatValue = (totalValue * vatRate) / (100 + vatRate);
        } else {
            this.totalVatValue = 0;
        }



        return this.totalVatValue;
    }

    calculateTotalAfterVat(totalBeforeVat, totalVatValue) {
        return totalBeforeVat + totalVatValue;

    }


    calculateTotalExceptVat() {
        return 0;
    }

    calculateTotalAmount(totalvalue, totalAfterVat, totalExceptVat, vatType) {

        var totalamount = 0;
        if (vatType === 1 || vatType === 2) {
            totalamount = totalAfterVat + totalExceptVat;
        } else {
            totalamount = totalvalue;
        }
        return totalamount;
    }


}

export default BillingCalculator;
