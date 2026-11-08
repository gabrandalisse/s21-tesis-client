import { ApiPet } from "@/services/types/interfaces";
import { Pet } from "../types/interfaces";
import config from "@/config";

export const convertApiPetToStorePet = (apiPet: ApiPet): Pet => {
  const getAbsolutePhotoUrl = (photoUrl?: string): string | undefined => {
    return config.resolveUploadUrl(photoUrl);
  };

  return {
    id: apiPet.id.toString(),
    name: apiPet.name,
    species: apiPet.type?.name || '',
    breed: apiPet.breed?.name || '',
    age: apiPet.age,
    color: apiPet.color?.name || '',
    size: apiPet.size?.name || '',
    sex: apiPet.sex?.name || '',
    distinguishingFeatures: apiPet.distinctiveCharacteristics || '',
    photo: getAbsolutePhotoUrl(apiPet.photoUrl),
    ownerId: apiPet.userId.toString(),
    typeId: apiPet.typeId,
    breedId: apiPet.breedId,
    colorId: apiPet.colorId,
    sizeId: apiPet.sizeId,
    sexId: apiPet.sexId,
  };
};
