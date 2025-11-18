class Booking {
  constructor(data = {}) {
    this.id = data.id || null;
    this.booking_reference_id = data.booking_reference_id || null;
    this.booking_date = data.booking_date || new Date().toISOString();
    this.booking_status = data.booking_status || 'pending';
    
    // Customer Personal Details
    this.customer_name = data.customer_name || '';
    this.customer_email = data.customer_email || '';
    this.customer_phone = data.customer_phone || '';
    this.customer_address = data.customer_address || '';
    this.customer_city = data.customer_city || '';
    this.customer_state = data.customer_state || '';
    this.customer_pincode = data.customer_pincode || '';
    
    // Car Details
    this.car_brand = data.car_brand || '';
    this.car_model = data.car_model || '';
    this.car_variant = data.car_variant || '';
    this.car_fuel_type = data.car_fuel_type || '';
    this.car_transmission = data.car_transmission || '';
    this.car_color = data.car_color || '';
    this.car_year = data.car_year || null;
    
    // Pricing Details
    this.ex_showroom_price = data.ex_showroom_price || 0;
    this.on_road_price = data.on_road_price || 0;
    this.booking_amount = data.booking_amount || 0;
    this.total_amount = data.total_amount || 0;
    
    // Additional Charges
    this.registration_charges = data.registration_charges || 0;
    this.insurance_amount = data.insurance_amount || 0;
    this.tcs_amount = data.tcs_amount || 0;
    this.accessories_amount = data.accessories_amount || 0;
    this.extended_warranty = data.extended_warranty || 0;
    
    // Finance Details
    this.finance_required = data.finance_required || false;
    this.finance_bank = data.finance_bank || '';
    this.loan_amount = data.loan_amount || 0;
    this.down_payment = data.down_payment || 0;
    this.emi_amount = data.emi_amount || 0;
    this.loan_tenure_months = data.loan_tenure_months || null;
    this.interest_rate = data.interest_rate || 0;
    
    // Payment Details
    this.payment_method = data.payment_method || 'online';
    this.payment_status = data.payment_status || 'pending';
    this.payment_reference_id = data.payment_reference_id || '';
    this.payment_date = data.payment_date || null;
    this.payment_gateway = data.payment_gateway || '';
    
    // Delivery & Location Details
    this.preferred_delivery_date = data.preferred_delivery_date || null;
    this.delivery_location = data.delivery_location || '';
    this.showroom_location = data.showroom_location || '';
    this.sales_executive_name = data.sales_executive_name || '';
    this.sales_executive_phone = data.sales_executive_phone || '';
    
    // Additional Information
    this.special_requirements = data.special_requirements || '';
    this.exchange_car_details = data.exchange_car_details || '';
    this.exchange_car_value = data.exchange_car_value || 0;
    this.referral_source = data.referral_source || '';
    this.marketing_campaign = data.marketing_campaign || '';
    
    // Lead & Source Tracking
    this.lead_source = data.lead_source || 'website';
    this.utm_source = data.utm_source || '';
    this.utm_medium = data.utm_medium || '';
    this.utm_campaign = data.utm_campaign || '';
    
    // Document Status
    this.documents_submitted = data.documents_submitted || false;
    this.kyc_verified = data.kyc_verified || false;
    this.agreement_signed = data.agreement_signed || false;
    
    // System Fields
    this.ip_address = data.ip_address || '';
    this.user_agent = data.user_agent || '';
    this.device_info = data.device_info || {};
    
    // Showroom Allocation Fields
    this.allocated_showroom_id = data.allocated_showroom_id || null;
    this.allocated_showroom_name = data.allocated_showroom_name || '';
    this.allocated_showroom_address = data.allocated_showroom_address || '';
    this.allocated_contact_person = data.allocated_contact_person || '';
    this.allocated_contact_phone = data.allocated_contact_phone || '';
    this.allocation_method = data.allocation_method || '';
    this.allocation_date = data.allocation_date || null;
    this.allocation_notes = data.allocation_notes || '';
    
    // Additional JSON field for flexible data
    this.additional_data = data.additional_data || {};
    
    // Notes and Comments
    this.internal_notes = data.internal_notes || '';
    this.customer_notes = data.customer_notes || '';
    
    // Audit Fields
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
    this.created_by = data.created_by || '';
    this.last_updated_by = data.last_updated_by || '';
  }

  isValid() {
    return this.customer_name && 
           this.customer_phone && 
           this.customer_email &&
           this.customer_city &&
           this.customer_pincode &&
           this.car_brand && 
           this.car_model &&
           this.booking_amount > 0;
  }

  toDatabase() {
    return {
      booking_reference_id: this.booking_reference_id,
      booking_date: this.booking_date,
      booking_status: this.booking_status,
      
      // Customer Details
      customer_name: this.customer_name,
      customer_email: this.customer_email,
      customer_phone: this.customer_phone,
      customer_address: this.customer_address,
      customer_city: this.customer_city,
      customer_state: this.customer_state,
      customer_pincode: this.customer_pincode,
      
      // Car Details
      car_brand: this.car_brand,
      car_model: this.car_model,
      car_variant: this.car_variant,
      car_fuel_type: this.car_fuel_type,
      car_transmission: this.car_transmission,
      car_color: this.car_color,
      car_year: this.car_year,
      
      // Pricing
      ex_showroom_price: this.ex_showroom_price,
      on_road_price: this.on_road_price,
      booking_amount: this.booking_amount,
      total_amount: this.total_amount,
      
      // Additional Charges
      registration_charges: this.registration_charges,
      insurance_amount: this.insurance_amount,
      tcs_amount: this.tcs_amount,
      accessories_amount: this.accessories_amount,
      extended_warranty: this.extended_warranty,
      
      // Finance
      finance_required: this.finance_required,
      finance_bank: this.finance_bank,
      loan_amount: this.loan_amount,
      down_payment: this.down_payment,
      emi_amount: this.emi_amount,
      loan_tenure_months: this.loan_tenure_months,
      interest_rate: this.interest_rate,
      
      // Payment
      payment_method: this.payment_method,
      payment_status: this.payment_status,
      payment_reference_id: this.payment_reference_id,
      payment_date: this.payment_date,
      payment_gateway: this.payment_gateway,
      
      // Delivery
      preferred_delivery_date: this.preferred_delivery_date,
      delivery_location: this.delivery_location,
      showroom_location: this.showroom_location,
      sales_executive_name: this.sales_executive_name,
      sales_executive_phone: this.sales_executive_phone,
      
      // Additional Info
      special_requirements: this.special_requirements,
      exchange_car_details: this.exchange_car_details,
      exchange_car_value: this.exchange_car_value,
      referral_source: this.referral_source,
      marketing_campaign: this.marketing_campaign,
      
      // Tracking
      lead_source: this.lead_source,
      utm_source: this.utm_source,
      utm_medium: this.utm_medium,
      utm_campaign: this.utm_campaign,
      
      // Documents
      documents_submitted: this.documents_submitted,
      kyc_verified: this.kyc_verified,
      agreement_signed: this.agreement_signed,
      
      // System
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      device_info: this.device_info,
      
      // Allocation (will be set by trigger)
      allocated_showroom_id: this.allocated_showroom_id,
      allocated_showroom_name: this.allocated_showroom_name,
      allocated_showroom_address: this.allocated_showroom_address,
      allocated_contact_person: this.allocated_contact_person,
      allocated_contact_phone: this.allocated_contact_phone,
      allocation_method: this.allocation_method,
      allocation_date: this.allocation_date,
      allocation_notes: this.allocation_notes,
      
      // Flexible data
      additional_data: this.additional_data,
      
      // Notes
      internal_notes: this.internal_notes,
      customer_notes: this.customer_notes,
      
      // Audit
      created_by: this.created_by,
      last_updated_by: this.last_updated_by
    };
  }

  static fromDatabase(dbRow) {
    return new Booking({
      id: dbRow.id,
      booking_reference_id: dbRow.booking_reference_id,
      booking_date: dbRow.booking_date,
      booking_status: dbRow.booking_status,
      
      customer_name: dbRow.customer_name,
      customer_email: dbRow.customer_email,
      customer_phone: dbRow.customer_phone,
      customer_address: dbRow.customer_address,
      customer_city: dbRow.customer_city,
      customer_state: dbRow.customer_state,
      customer_pincode: dbRow.customer_pincode,
      
      car_brand: dbRow.car_brand,
      car_model: dbRow.car_model,
      car_variant: dbRow.car_variant,
      car_fuel_type: dbRow.car_fuel_type,
      car_transmission: dbRow.car_transmission,
      car_color: dbRow.car_color,
      car_year: dbRow.car_year,
      
      ex_showroom_price: dbRow.ex_showroom_price,
      on_road_price: dbRow.on_road_price,
      booking_amount: dbRow.booking_amount,
      total_amount: dbRow.total_amount,
      
      registration_charges: dbRow.registration_charges,
      insurance_amount: dbRow.insurance_amount,
      tcs_amount: dbRow.tcs_amount,
      accessories_amount: dbRow.accessories_amount,
      extended_warranty: dbRow.extended_warranty,
      
      finance_required: dbRow.finance_required,
      finance_bank: dbRow.finance_bank,
      loan_amount: dbRow.loan_amount,
      down_payment: dbRow.down_payment,
      emi_amount: dbRow.emi_amount,
      loan_tenure_months: dbRow.loan_tenure_months,
      interest_rate: dbRow.interest_rate,
      
      payment_method: dbRow.payment_method,
      payment_status: dbRow.payment_status,
      payment_reference_id: dbRow.payment_reference_id,
      payment_date: dbRow.payment_date,
      payment_gateway: dbRow.payment_gateway,
      
      preferred_delivery_date: dbRow.preferred_delivery_date,
      delivery_location: dbRow.delivery_location,
      showroom_location: dbRow.showroom_location,
      sales_executive_name: dbRow.sales_executive_name,
      sales_executive_phone: dbRow.sales_executive_phone,
      
      special_requirements: dbRow.special_requirements,
      exchange_car_details: dbRow.exchange_car_details,
      exchange_car_value: dbRow.exchange_car_value,
      referral_source: dbRow.referral_source,
      marketing_campaign: dbRow.marketing_campaign,
      
      lead_source: dbRow.lead_source,
      utm_source: dbRow.utm_source,
      utm_medium: dbRow.utm_medium,
      utm_campaign: dbRow.utm_campaign,
      
      documents_submitted: dbRow.documents_submitted,
      kyc_verified: dbRow.kyc_verified,
      agreement_signed: dbRow.agreement_signed,
      
      ip_address: dbRow.ip_address,
      user_agent: dbRow.user_agent,
      device_info: dbRow.device_info,
      
      allocated_showroom_id: dbRow.allocated_showroom_id,
      allocated_showroom_name: dbRow.allocated_showroom_name,
      allocated_showroom_address: dbRow.allocated_showroom_address,
      allocated_contact_person: dbRow.allocated_contact_person,
      allocated_contact_phone: dbRow.allocated_contact_phone,
      allocation_method: dbRow.allocation_method,
      allocation_date: dbRow.allocation_date,
      allocation_notes: dbRow.allocation_notes,
      
      additional_data: dbRow.additional_data,
      internal_notes: dbRow.internal_notes,
      customer_notes: dbRow.customer_notes,
      
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      created_by: dbRow.created_by,
      last_updated_by: dbRow.last_updated_by
    });
  }

  toJSON() {
    return {
      id: this.id,
      booking_reference_id: this.booking_reference_id,
      booking_date: this.booking_date,
      booking_status: this.booking_status,
      
      customer: {
        name: this.customer_name,
        email: this.customer_email,
        phone: this.customer_phone,
        address: this.customer_address,
        city: this.customer_city,
        state: this.customer_state,
        pincode: this.customer_pincode
      },
      
      car: {
        brand: this.car_brand,
        model: this.car_model,
        variant: this.car_variant,
        fuel_type: this.car_fuel_type,
        transmission: this.car_transmission,
        color: this.car_color,
        year: this.car_year
      },
      
      pricing: {
        ex_showroom_price: this.ex_showroom_price,
        on_road_price: this.on_road_price,
        booking_amount: this.booking_amount,
        total_amount: this.total_amount
      },
      
      allocated_showroom: {
        id: this.allocated_showroom_id,
        name: this.allocated_showroom_name,
        address: this.allocated_showroom_address,
        contact_person: this.allocated_contact_person,
        contact_phone: this.allocated_contact_phone,
        allocation_method: this.allocation_method,
        allocation_date: this.allocation_date
      },
      
      payment: {
        method: this.payment_method,
        status: this.payment_status,
        reference_id: this.payment_reference_id,
        date: this.payment_date,
        gateway: this.payment_gateway
      },
      
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Booking;