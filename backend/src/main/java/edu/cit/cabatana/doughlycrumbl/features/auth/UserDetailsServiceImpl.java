package edu.cit.cabatana.doughlycrumbl.features.auth;

import edu.cit.cabatana.doughlycrumbl.model.User;
import edu.cit.cabatana.doughlycrumbl.repository.UserRepository;
import edu.cit.cabatana.doughlycrumbl.features.auth.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return CustomUserDetails.fromUser(user);
    }
}
