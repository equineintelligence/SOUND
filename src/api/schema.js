// Field types for each table, generated from the original Base44 entity schemas.
// The data layer uses this to drop unknown fields and to turn empty strings into
// null for number and boolean columns, the way Base44 did.
export const ENTITIES = {
  "Business": {
    "table": "businesses",
    "fields": {
      "name": "string",
      "type": "array",
      "area": "string",
      "description": "string",
      "services": "array",
      "phone": "string",
      "website": "string",
      "photos": "array",
      "opening_hours": "string",
      "contact_email": "string",
      "status": "enum",
      "source": "enum",
      "claimed_by": "string",
      "ownership_proof": "string",
      "rating_overall": "number",
      "rating_horse_care": "number",
      "rating_communication": "number",
      "rating_value": "number",
      "rating_professionalism": "number",
      "rating_facilities": "number",
      "review_count": "number"
    }
  },
  "BusinessClaim": {
    "table": "business_claims",
    "fields": {
      "business": "string",
      "contact_name": "string",
      "contact_email": "string",
      "role_at_business": "string",
      "proof_uri": "string",
      "proof_name": "string",
      "status": "enum",
      "moderator_note": "string"
    }
  },
  "BusinessReply": {
    "table": "business_replies",
    "fields": {
      "review": "string",
      "business": "string",
      "text": "string",
      "status": "enum"
    }
  },
  "CareVisit": {
    "table": "care_visits",
    "fields": {
      "horse": "string",
      "horse_name": "string",
      "type": "enum",
      "provider": "string",
      "date": "string",
      "time": "string",
      "cost": "number",
      "notes": "string"
    }
  },
  "Flag": {
    "table": "flags",
    "fields": {
      "review": "string",
      "business": "string",
      "type": "enum",
      "reason": "string",
      "details": "string",
      "status": "enum",
      "outcome": "string"
    }
  },
  "Horse": {
    "table": "horses",
    "fields": {
      "name": "string",
      "breed": "string",
      "sex": "enum",
      "date_of_birth": "string",
      "age": "number",
      "height_cm": "number",
      "colour": "string",
      "photo_uri": "string",
      "notes": "string"
    }
  },
  "Membership": {
    "table": "memberships",
    "fields": {
      "user_id": "string",
      "user_email": "string",
      "user_name": "string",
      "plan": "enum",
      "status": "enum",
      "business_membership": "boolean",
      "business_name": "string",
      "started_date": "string",
      "note": "string"
    }
  },
  "ProofOfCustom": {
    "table": "proofs_of_custom",
    "fields": {
      "review": "string",
      "business": "string",
      "file_uri": "string",
      "file_name": "string",
      "month_of_service": "string"
    }
  },
  "Review": {
    "table": "reviews",
    "fields": {
      "business": "string",
      "business_name": "string",
      "business_owner_id": "string",
      "reviewer": "string",
      "display_name": "string",
      "overall_rating": "number",
      "criterion_horse_care": "number",
      "criterion_communication": "number",
      "criterion_value": "number",
      "criterion_professionalism": "number",
      "criterion_facilities": "number",
      "topic": "string",
      "service_used": "string",
      "month_of_service": "string",
      "text": "string",
      "status": "enum",
      "declaration_accepted": "boolean",
      "senior_review": "boolean",
      "screening_notes": "array",
      "moderator_note": "string",
      "proof_uri": "string",
      "proof_name": "string",
      "published_date": "string"
    }
  },
  "RidePlan": {
    "table": "ride_plans",
    "fields": {
      "title": "string",
      "type": "enum",
      "horse": "string",
      "horse_name": "string",
      "date": "string",
      "time": "string",
      "location": "string",
      "notes": "string"
    }
  },
  "Rosette": {
    "table": "rosettes",
    "fields": {
      "business": "string",
      "category": "enum",
      "category_label": "string",
      "year": "number",
      "status": "enum",
      "average": "number",
      "review_count": "number",
      "awarded_date": "string"
    }
  },
  "TrainingResource": {
    "table": "training_resources",
    "fields": {
      "title": "string",
      "kind": "enum",
      "summary": "string",
      "body": "string",
      "video_url": "string",
      "cover_url": "string",
      "duration": "string"
    }
  },
  "UpgradeRequest": {
    "table": "upgrade_requests",
    "fields": {
      "user_id": "string",
      "user_email": "string",
      "user_name": "string",
      "request_type": "enum",
      "business_id": "string",
      "business_name": "string",
      "message": "string",
      "status": "enum",
      "invoice_number": "string",
      "invoice_amount": "number",
      "invoice_date": "string",
      "invoice_due": "string",
      "admin_note": "string"
    }
  },
  "LibraryDocument": {
    "table": "library_documents",
    "fields": {
      "title": "string",
      "category": "string",
      "description": "string",
      "audience": "enum",
      "file_uri": "string",
      "file_name": "string",
      "file_type": "string",
      "file_size": "number",
      "version": "string"
    }
  }

};
