using AutoMapper;
using backend.Data.Entities;
using backend.Models.Responses;

namespace backend.MappingProfiles;

public class ItemTagProfiles : Profile
{
    public ItemTagProfiles()
    {
        CreateMap<ItemTag, ItemTagsIndexResponse>();
    }
}