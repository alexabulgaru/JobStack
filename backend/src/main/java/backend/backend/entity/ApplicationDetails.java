package backend.backend.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "application_details")
public class ApplicationDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "hr_contact_email")
    private String hrContactEmail;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", unique = true)
    private JobApplication jobApplication;

    public Long getId() {
        return id;
    }

    public ApplicationDetails setId(Long id) {
        this.id = id;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public ApplicationDetails setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getHrContactEmail() {
        return hrContactEmail;
    }

    public ApplicationDetails setHrContactEmail(String hrContactEmail) {
        this.hrContactEmail = hrContactEmail;
        return this;
    }

    public JobApplication getJobApplication() {
        return jobApplication;
    }

    public ApplicationDetails setJobApplication(JobApplication jobApplication) {
        this.jobApplication = jobApplication;
        return this;
    }
}
