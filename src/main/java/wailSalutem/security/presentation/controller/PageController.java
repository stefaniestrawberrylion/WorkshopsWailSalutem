package wailSalutem.security.presentation.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/inlog")
    public String showLogin() {
        return "forward:/html/inLog.html";
    }

    @GetMapping("/toevoegen")
    public String showWorkshopToevoegen() {
        return "forward:/html/workshopToevoegen.html";
    }

    @GetMapping("/dashboard")
    public String showDashboard() {
        return "forward:/html/dashboardAdmin.html";
    }
    @GetMapping("/dashboardUser")
    public String showDashboardUser() {
        return "forward:/html/dashboardUser.html";
    }
    @GetMapping("/workshopUser")
    public String showWorkshopUser() {
        return "forward:/html/workshopUser.html";
    }
    @GetMapping("/profielAdmin")
    public String showProfileAdmin() {
        return "forward:/html/gebruikersProfiel.html";
    }
}
