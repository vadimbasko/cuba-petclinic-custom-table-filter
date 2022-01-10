import { NamedEntity } from "./NamedEntity";
import { PetType } from "./petclinic_PetType";
import { Owner } from "./petclinic_Owner";
export class Pet extends NamedEntity {
  static NAME = "petclinic_Pet";
  identificationNumber?: string | null;
  birthDate?: any | null;
  type?: PetType | null;
  owner?: Owner | null;
}
export type PetViewName =
  | "_base"
  | "_local"
  | "_minimal"
  | "pet-with-owner-and-type";
export type PetView<V extends PetViewName> = V extends "_base"
  ? Pick<Pet, "id" | "identificationNumber" | "name" | "birthDate">
  : V extends "_local"
  ? Pick<Pet, "id" | "identificationNumber" | "birthDate" | "name">
  : V extends "_minimal"
  ? Pick<Pet, "id" | "identificationNumber" | "name">
  : V extends "pet-with-owner-and-type"
  ? Pick<
      Pet,
      "id" | "identificationNumber" | "birthDate" | "name" | "type" | "owner"
    >
  : never;
