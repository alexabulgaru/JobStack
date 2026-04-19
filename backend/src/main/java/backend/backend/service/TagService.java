package backend.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import backend.backend.entity.Tag;
import backend.backend.exception.ConflictException;
import backend.backend.exception.ResourceNotFoundException;
import backend.backend.repository.TagRepository;
import backend.backend.service.dto.TagRequest;
import backend.backend.service.dto.TagResponse;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public TagResponse createTag(TagRequest request) {        
        String tagName = request.getName().toLowerCase().trim();

        if (tagRepository.findByName(tagName).isPresent()) {
            throw new ConflictException("The tag '" + tagName + "' already exists!");
        }

        Tag tag = new Tag();
        tag.setName(tagName);
        return mapToResponse(tagRepository.save(tag));
    }

    public Page<TagResponse> getAllTags(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return tagRepository.findAll(pageable).map(this::mapToResponse);
    }

    public TagResponse getById(Long id) {
        Tag tag = getTagEntityById(id);
        return mapToResponse(tag);
    }

    public TagResponse updateTag(Long id, TagRequest request) {
        Tag existing = getTagEntityById(id);
        String newName = request.getName().toLowerCase().trim();

        tagRepository.findByName(newName).ifPresent(t -> {
            if (!t.getId().equals(id)) {
                throw new ConflictException("The name '" + newName + "' is already in use!");
            }
        });

        existing.setName(newName);
        return mapToResponse(tagRepository.save(existing));
    }

    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new ResourceNotFoundException("The tag does not exist!");
        }
        tagRepository.deleteById(id);
    }

    private Tag getTagEntityById(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag with ID " + id + " not found!"));
    }

    private TagResponse mapToResponse(Tag tag) {
        TagResponse response = new TagResponse();
        response.setId(tag.getId());
        response.setName(tag.getName());
        return response;
    }
}
