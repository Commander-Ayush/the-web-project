package com.thewebproject.app.thwebproject.repositories;

import com.thewebproject.app.thwebproject.entity.Requests;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestRepo extends JpaRepository<Requests, Integer> {
}
