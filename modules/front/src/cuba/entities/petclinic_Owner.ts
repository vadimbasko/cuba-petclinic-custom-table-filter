import { Person } from "./Person";
import { Pet } from "./petclinic_Pet";
export class Owner extends Person {
  static NAME = "petclinic_Owner";
  address?: string | null;
  city?: string | null;
  email?: string | null;
  telephone?: string | null;
  pets?: Pet[] | null;
}
export type OwnerViewName = "_base" | "_local" | "_minimal" | "owner-with-pets";
export type OwnerView<V extends OwnerViewName> = V extends "_base"
  ? Pick<
      Owner,
      | "id"
      | "firstName"
      | "lastName"
      | "address"
      | "city"
      | "email"
      | "telephone"
      | "name"
    >
  : V extends "_local"
  ? Pick<
      Owner,
      | "id"
      | "address"
      | "city"
      | "email"
      | "telephone"
      | "firstName"
      | "lastName"
      | "name"
    >
  : V extends "_minimal"
  ? Pick<Owner, "id" | "firstName" | "lastName">
  : V extends "owner-with-pets"
  ? Pick<
      Owner,
      | "id"
      | "address"
      | "city"
      | "email"
      | "telephone"
      | "firstName"
      | "lastName"
      | "name"
      | "pets"
    >
  : never;
