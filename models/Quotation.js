// models/Quotation.js

class Quotation {
  constructor(data) {
    this.vendor_id = data.vendor_id ? String(data.vendor_id) : data.vendor_id;
    this.car_model = data.car_model;
    this.model_variant = data.model_variant;
    this.roi_emi_interest = data.roi_emi_interest;
    this.sbi_bank = data.sbi_bank;
    this.union_bank = data.union_bank;
    this.indusind_bank = data.indusind_bank;
    this.au_bank = data.au_bank;
    this.ex_showroom = data.ex_showroom;
    this.tcs = data.tcs;
    this.registration = data.registration;
    this.insurance = data.insurance;
    this.number_plate_crtm_autocard = data.number_plate_crtm_autocard;
    this.gps = data.gps;
    this.fastag = data.fastag;
    this.speed_governor = data.speed_governor;
    this.accessories = data.accessories;
    this.on_the_road = data.on_the_road;
    this.loan_amount = data.loan_amount;
    this.margin_down_payment = data.margin_down_payment;
    this.process_fee = data.process_fee;
    this.stamp_duty = data.stamp_duty;
    this.handling_document_charge = data.handling_document_charge;
    this.loan_suraksha_insurance = data.loan_suraksha_insurance;
    this.down_payment = data.down_payment;
    this.offers = data.offers;
    this.final_down_payment = data.final_down_payment;
    this.emi_years = data.emi_years;
    this.monthly_emi = data.monthly_emi;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Method to validate required fields
  isValid() {
    return (
      this.vendor_id &&
      this.car_model &&
      this.model_variant &&
      typeof this.roi_emi_interest === 'number' &&
      typeof this.ex_showroom === 'number' &&
      typeof this.on_the_road === 'number'
    );
  }

  // Method to convert to database object
  toDatabase() {
    return {
      vendor_id: String(this.vendor_id),
      car_model: this.car_model,
      model_variant: this.model_variant,
      roi_emi_interest: this.roi_emi_interest,
      sbi_bank: this.sbi_bank,
      union_bank: this.union_bank,
      indusind_bank: this.indusind_bank,
      au_bank: this.au_bank,
      ex_showroom: this.ex_showroom,
      tcs: this.tcs,
      registration: this.registration,
      insurance: this.insurance,
      number_plate_crtm_autocard: this.number_plate_crtm_autocard,
      gps: this.gps,
      fastag: this.fastag,
      speed_governor: this.speed_governor,
      accessories: this.accessories,
      on_the_road: this.on_the_road,
      loan_amount: this.loan_amount,
      margin_down_payment: this.margin_down_payment,
      process_fee: this.process_fee,
      stamp_duty: this.stamp_duty,
      handling_document_charge: this.handling_document_charge,
      loan_suraksha_insurance: this.loan_suraksha_insurance,
      down_payment: this.down_payment,
      offers: this.offers,
      final_down_payment: this.final_down_payment,
      emi_years: this.emi_years,
      monthly_emi: this.monthly_emi,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Static method to create from database object
  static fromDatabase(data) {
    return new Quotation(data);
  }
}

module.exports = Quotation; 