package backend.backend.service;

import backend.backend.entity.Tag;
import backend.backend.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public Tag createTag(Tag tag) {        
        String tagName = tag.getName().toLowerCase().trim();

        if (tagRepository.findByName(tagName).isPresent()) {
            throw new RuntimeException("The tag '" + tagName + "' already exists!");
        }

        tag.setName(tagName);
        return tagRepository.save(tag);
    }

    public Page<Tag> getAllTags(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return tagRepository.findAll(pageable);
    }

    public Tag getById(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag with ID " + id + " not found!"));
    }

    public Tag updateTag(Long id, Tag updatedTag) {
        Tag existing = getById(id);
        String newName = updatedTag.getName().toLowerCase().trim();

        tagRepository.findByName(newName).ifPresent(t -> {
            if (!t.getId().equals(id)) {
                throw new RuntimeException("The name '" + newName + "' is already in use!");
            }
        });

        existing.setName(newName);
        return tagRepository.save(existing);
    }

    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new RuntimeException("The tag does not exist!");
        }
        tagRepository.deleteById(id);
    }
}
