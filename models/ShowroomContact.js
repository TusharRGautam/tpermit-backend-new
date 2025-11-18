class ShowroomContact {
  constructor(data = {}) {
    this.id = data.id || null;
    this.showroom_id = data.showroom_id || null;
    this.contact_person_name = data.contact_person_name || '';
    this.designation = data.designation || '';
    this.phone_number = data.phone_number || '';
    this.email_address = data.email_address || '';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  isValid() {
    return this.showroom_id && 
           this.contact_person_name;
  }

  toDatabase() {
    return {
      showroom_id: this.showroom_id,
      contact_person_name: this.contact_person_name,
      designation: this.designation,
      phone_number: this.phone_number,
      email_address: this.email_address
    };
  }

  static fromDatabase(dbRow) {
    return new ShowroomContact({
      id: dbRow.id,
      showroom_id: dbRow.showroom_id,
      contact_person_name: dbRow.contact_person_name,
      designation: dbRow.designation,
      phone_number: dbRow.phone_number,
      email_address: dbRow.email_address,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at
    });
  }

  toJSON() {
    return {
      id: this.id,
      showroom_id: this.showroom_id,
      contact_person_name: this.contact_person_name,
      designation: this.designation,
      phone_number: this.phone_number,
      email_address: this.email_address,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = ShowroomContact;