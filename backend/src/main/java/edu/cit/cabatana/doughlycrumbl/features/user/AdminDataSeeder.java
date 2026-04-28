package edu.cit.cabatana.doughlycrumbl.features.user;

import edu.cit.cabatana.doughlycrumbl.features.user.User;
import edu.cit.cabatana.doughlycrumbl.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@RequiredArgsConstructor
public class AdminDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("doughlycrumbl@gmail.com")) {
            return;
        }

        User admin = User.builder()
                .name("Doughly Crumbl")
                .email("doughlycrumbl@gmail.com")
                .password(passwordEncoder.encode("Ilovecookies1718!"))
                .role("ADMIN")
                .build();

        userRepository.save(admin);
    }
}
