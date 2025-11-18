class Showroom {
  constructor(data = {}) {
    this.id = data.id || null;
    this.showroom_name = data.showroom_name || '';
    this.showroom_address = data.showroom_address || '';
    this.state = data.state || '';
    this.address_city = data.address_city || '';
    this.showroom_city = data.showroom_city || '';
    this.brand = data.brand || '';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  isValid() {
    return this.showroom_name && 
           this.showroom_address && 
           this.state && 
           this.address_city && 
           this.brand;
  }

  toDatabase() {
    return {
      showroom_name: this.showroom_name,
      showroom_address: this.showroom_address,
      state: this.state,
      address_city: this.address_city,
      showroom_city: this.showroom_city,
      brand: this.brand
    };
  }

  static fromDatabase(dbRow) {
    return new Showroom({
      id: dbRow.id,
      showroom_name: dbRow.showroom_name,
      showroom_address: dbRow.showroom_address,
      state: dbRow.state,
      address_city: dbRow.address_city,
      showroom_city: dbRow.showroom_city,
      brand: dbRow.brand,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at
    });
  }

  toJSON() {
    return {
      id: this.id,
      showroom_name: this.showroom_name,
      showroom_address: this.showroom_address,
      state: this.state,
      address_city: this.address_city,
      showroom_city: this.showroom_city,
      brand: this.brand,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Showroom;