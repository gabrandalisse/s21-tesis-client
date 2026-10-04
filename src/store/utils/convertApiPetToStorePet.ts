import { ApiPet } from "@/services/types/interfaces";
import { Pet } from "../types/interfaces";
import config from "@/config";

export const convertApiPetToStorePet = (apiPet: ApiPet): Pet => {
  const getSpecies = (typeName?: string): 'dog' | 'cat' | 'bird' | 'other' => {
    if (!typeName) return 'other';
    const lowerType = typeName.toLowerCase();
    if (['dog', 'cat', 'bird'].includes(lowerType)) {
      return lowerType as 'dog' | 'cat' | 'bird';
    }
    return 'other';
  };

  const getAbsolutePhotoUrl = (photoUrl?: string): string | undefined => {
    return config.resolveUploadUrl(photoUrl);
  };

  return {
    id: apiPet.id.toString(),
    name: apiPet.name,
    species: getSpecies(apiPet.type?.name),
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
