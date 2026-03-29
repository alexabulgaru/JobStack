package backend.backend.controller;

import backend.backend.entity.Tag;
import backend.backend.service.TagService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Tag> createTag(@RequestBody Tag tag) {
        return ResponseEntity.ok(tagService.createTag(tag));
    }

    @GetMapping("/get-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Tag>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @GetMapping("/get-one/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Tag> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tagService.getById(id));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Tag> updateTag(@PathVariable Long id, @RequestBody Tag tag) {
        return ResponseEntity.ok(tagService.updateTag(id, tag));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.ok("Tag deleted successfully");
    }
}
