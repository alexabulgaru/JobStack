package backend.backend.service;

import backend.backend.entity.Status;
import backend.backend.repository.StatusRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class StatusService {

    private final StatusRepository statusRepository;

    public StatusService(StatusRepository statusRepository) {
        this.statusRepository = statusRepository;
    }

    public Status createStatus(Status status) {
        String statusName = status.getName().toUpperCase();

        if (statusRepository.findByName(statusName).isPresent()) {
            throw new RuntimeException("Status '" + statusName + "' already exists!");
        }

        status.setName(statusName);
        return statusRepository.save(status);
    }

    public Page<Status> getAllStatuses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return statusRepository.findAll(pageable);
    }

    public Status getStatusById(Long id) {
        return statusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Status with ID " + id + " not found!"));
    }

    public Status updateStatus(Long id, Status updatedStatus) {
        Status existingStatus = getStatusById(id);
        String newStatusName = updatedStatus.getName().toUpperCase();

        statusRepository.findByName(newStatusName).ifPresent(s -> {
            if (!s.getId().equals(id)) {
                throw new RuntimeException("The name '" + newStatusName + "' is already used by another status!");
            }
        });

        existingStatus.setName(newStatusName);
        return statusRepository.save(existingStatus);
    }

    public void deleteStatus(Long id) {
        Status existingStatus = getStatusById(id);
        
        if (existingStatus.getName().equals("PENDING") || existingStatus.getName().equals("ACCEPTED")) {
            throw new RuntimeException("Critical system statuses cannot be deleted!");
        }

        statusRepository.delete(existingStatus);
    }
}
