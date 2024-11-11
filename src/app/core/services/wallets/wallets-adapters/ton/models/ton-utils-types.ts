export interface AddressBookResponse {
  raw_form: string;
  bounceable: {
    b64: string;
    b64url: string;
  };
  non_bounceable: {
    b64: string;
    b64url: string;
  };
  given_type: string;
  test_only: boolean;
}
