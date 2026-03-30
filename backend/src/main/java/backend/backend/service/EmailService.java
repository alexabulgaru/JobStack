package backend.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(String to, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setFrom("noreply@jobstack.com");
        message.setTo(to);
        message.setSubject("Bun venit pe JobStack!");
        message.setText("Buna, " + firstName + "!\n\n" +
                "Contul tău a fost creat cu succes. Bine ai venit, rau ai nimerit!\n\n" +
                "Mult succes,\nEchipa JobStack");

        mailSender.send(message);
    }
}
