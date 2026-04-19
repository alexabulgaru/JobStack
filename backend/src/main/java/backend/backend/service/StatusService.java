package backend.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import backend.backend.entity.Status;
import backend.backend.exception.ConflictException;
import backend.backend.exception.ForbiddenOperationException;
import backend.backend.exception.ResourceNotFoundException;
import backend.backend.repository.StatusRepository;
import backend.backend.service.dto.StatusRequest;
import backend.backend.service.dto.StatusResponse;

@Service
public class StatusService {

    private final StatusRepository statusRepository;

    public StatusService(StatusRepository statusRepository) {
        this.statusRepository = statusRepository;
    }

    public StatusResponse createStatus(StatusRequest request) {
        String statusName = request.getName().toUpperCase();

        if (statusRepository.findByName(statusName).isPresent()) {
            throw new ConflictException("Status '" + statusName + "' already exists!");
        }

        Status status = new Status();
        status.setName(statusName);
        return mapToResponse(statusRepository.save(status));
    }

    public Page<StatusResponse> getAllStatuses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return statusRepository.findAll(pageable).map(this::mapToResponse);
    }

    public StatusResponse getStatusById(Long id) {
        Status status = getStatusEntityById(id);
        return mapToResponse(status);
    }

    public StatusResponse updateStatus(Long id, StatusRequest request) {
        Status existingStatus = getStatusEntityById(id);
        String newStatusName = request.getName().toUpperCase();

        statusRepository.findByName(newStatusName).ifPresent(s -> {
            if (!s.getId().equals(id)) {
                throw new ConflictException("The name '" + newStatusName + "' is already used by another status!");
            }
        });

        existingStatus.setName(newStatusName);
        return mapToResponse(statusRepository.save(existingStatus));
    }

    public void deleteStatus(Long id) {
        Status existingStatus = getStatusEntityById(id);
        
        if (existingStatus.getName().equals("PENDING") || existingStatus.getName().equals("ACCEPTED")) {
            throw new ForbiddenOperationException("Critical system statuses cannot be deleted!");
        }

        statusRepository.delete(existingStatus);
    }

    private Status getStatusEntityById(Long id) {
        return statusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Status with ID " + id + " not found!"));
    }

    private StatusResponse mapToResponse(Status status) {
        StatusResponse response = new StatusResponse();
        response.setId(status.getId());
        response.setName(status.getName());
        return response;
    }
}
