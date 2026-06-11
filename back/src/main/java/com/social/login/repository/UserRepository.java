package com.social.login.repository;

import com.social.login.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // id 기준으로 사용자 존재 여부 확인
    boolean existsByUsername(String username);  // id 기준으로 존재 여부 확인

    boolean existsByNickname(String nickname);  // nickname 기준으로 존재 여부 확인

    // id 기준으로 UserEntity 찾기
    User findByUsername(String username);  // id 기준으로 찾기

    Optional<User> findByUserId(Integer userId);

    @Transactional
    @Modifying
    @Query(value = "UPDATE users SET constellation = :minStarskyId WHERE user_id = :userId", nativeQuery = true)
    void updateUserConstellation(@Param("userId") Integer userId, @Param("minStarskyId") Integer minStarskyId);

    @Query(value = "SELECT constellation FROM users WHERE user_id = :userId", nativeQuery = true)
    Integer findConstellationByUserId(@Param("userId") Integer userId);


    @Query("SELECT u FROM User u WHERE u.nickname LIKE %:nickname%")
    List<User> findByNicknameContaining(@Param("nickname") String nickname);

    // ✅ 추천된 친구들의 정보를 가져오기
    @Query("SELECT u FROM User u WHERE u.userId IN :friendIds")
    List<User> findUsersByIds(@Param("friendIds") List<Integer> friendIds);

    Optional<User> findByDeviceId(String deviceId);
    List<User> findByDeviceIdIn(List<String> deviceIds);



}
