using AutoMapper;
using backend.Data.Entities;
using backend.Models.Requests;
using backend.Models.Responses;

namespace backend.MappingProfiles;

public class ItemTagProfiles : Profile
{
    public ItemTagProfiles()
    {
        CreateMap<CreateItemTagRequest, ItemTag>();

        CreateMap<ItemTag, ItemTagsIndexResponse>();
        CreateMap<ItemTag, ViewItemTagResponse>()
            .ForMember(t => t.Description, opt => opt.Ignore());
        CreateMap<ItemTag, CreateItemTagResponse>();
    }
}