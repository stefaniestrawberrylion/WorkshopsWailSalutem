package wailSalutem.security.presentation.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/inlog")
    public String showLogin() {
        return "forward:/html/inLog.html";
    }
}



