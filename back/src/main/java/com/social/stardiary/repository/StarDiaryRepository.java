package com.social.stardiary.repository;

import com.social.stardiary.entity.StarDiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StarDiaryRepository extends JpaRepository<StarDiary, Integer> {
}
