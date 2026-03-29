package backend.backend.entity;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id", nullable = false)
    private Status status;

    @OneToOne(mappedBy = "jobApplication", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ApplicationDetails applicationDetails;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "job_application_tags",
        joinColumns = @JoinColumn(name = "job_application_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    public Long getId() {
        return id;
    }

    public JobApplication setId(Long id) {
        this.id = id;
        return this;
    }

    public String getCompanyName() {
        return companyName;
    }

    public JobApplication setCompanyName(String companyName) {
        this.companyName = companyName;
        return this;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public JobApplication setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
        return this;
    }

    public User getUser() {
        return user;
    }

    public JobApplication setUser(User user) {
        this.user = user;
        return this;
    }

    public Status getStatus() {
        return status;
    }

    public JobApplication setStatus(Status status) {
        this.status = status;
        return this;
    }

    public ApplicationDetails getApplicationDetails() {
        return applicationDetails;
    }

    public JobApplication setApplicationDetails(ApplicationDetails applicationDetails) {
        this.applicationDetails = applicationDetails;
        return this;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public JobApplication setTags(Set<Tag> tags) {
        this.tags = tags;
        return this;
    }
}
