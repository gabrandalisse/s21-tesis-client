import { CatalogSlice, CommonSlice, PetSlice, ReportSlice } from "./interfaces";

export type PetStoreState = CommonSlice & CatalogSlice & PetSlice & ReportSlice;
