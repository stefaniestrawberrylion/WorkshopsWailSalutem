package workshop.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import workshop.domain.Workshop;

@Repository
public interface WorkshopRepository extends JpaRepository<Workshop, Long> {
    // Geen extra methodes nodig, JpaRepository heeft al findAll(), findById() en save()
}
