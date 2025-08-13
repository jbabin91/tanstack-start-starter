#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "cchooks>=0.1.3",
# ]
# ///

"""
Modern post-tool-use hook using cchooks SDK
Handles quality checks, formatting, linting, and notifications
"""

import subprocess
import sys
from pathlib import Path
from typing import List, Dict, Any

from cchooks import create_context, PostToolUseContext


def should_skip_file(file_path: str) -> bool:
    """Check if we should skip processing this file"""
    skip_patterns = [
        # Generated files
        "routeTree.gen.ts",
        ".tanstack/",
        ".output/",
        "node_modules/",
        ".git/",
        
        # Build artifacts  
        "dist/",
        "build/",
        ".next/",
        
        # Logs and temp files
        "*.log",
        ".tmp/",
        ".claude/logs/",
    ]
    
    for pattern in skip_patterns:
        if pattern in file_path or file_path.endswith(pattern.replace("*", "")):
            return True
    return False


def run_format_check(file_path: str) -> Dict[str, Any]:
    """Run prettier formatting check"""
    try:
        # Check if file needs formatting
        result = subprocess.run(
            ["pnpm", "format:check", file_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            return {"success": True, "changed": False}
        else:
            # File needs formatting - apply it
            format_result = subprocess.run(
                ["pnpm", "format", file_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if format_result.returncode == 0:
                return {"success": True, "changed": True, "message": "Code formatted"}
            else:
                return {"success": False, "error": format_result.stderr}
                
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Format check timed out"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def run_lint_check(file_path: str) -> Dict[str, Any]:
    """Run ESLint check and auto-fix"""
    if not file_path.endswith(('.ts', '.tsx', '.js', '.jsx')):
        return {"success": True, "changed": False}
    
    try:
        # Run lint with auto-fix
        result = subprocess.run(
            ["pnpm", "lint:fix", file_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            return {"success": True, "changed": True, "message": "Linting completed"}
        else:
            # Check if there are remaining issues
            check_result = subprocess.run(
                ["pnpm", "lint", file_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if check_result.returncode == 0:
                return {"success": True, "changed": True, "message": "Linting issues fixed"}
            else:
                return {"success": False, "error": check_result.stdout, "warnings": True}
                
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Lint check timed out"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def run_ide_diagnostics(file_path: str) -> Dict[str, Any]:
    """Run IDE diagnostics check using MCP, with comprehensive fallback"""
    try:
        # Try IDE diagnostics first
        import subprocess
        import json
        
        # Call mcp__ide__getDiagnostics via claude command
        result = subprocess.run(
            ["claude", "--mcp-call", "mcp__ide__getDiagnostics", f"--uri=file://{Path(file_path).resolve()}"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            diagnostics_data = json.loads(result.stdout)
            
            # Find diagnostics for our file
            file_diagnostics = []
            for item in diagnostics_data:
                if file_path in item.get("uri", ""):
                    file_diagnostics.extend(item.get("diagnostics", []))
            
            # Categorize diagnostics
            errors = [d for d in file_diagnostics if d.get("severity") == 1]  # Error
            warnings = [d for d in file_diagnostics if d.get("severity") == 2]  # Warning
            
            if errors:
                error_messages = [f"Line {d.get('range', {}).get('start', {}).get('line', '?')}: {d.get('message', 'Unknown error')}" for d in errors]
                return {"success": False, "error": "; ".join(error_messages), "warnings": len(warnings) > 0}
            elif warnings:
                warning_messages = [f"Line {d.get('range', {}).get('start', {}).get('line', '?')}: {d.get('message', 'Unknown warning')}" for d in warnings]
                return {"success": True, "changed": False, "warnings": "; ".join(warning_messages)}
            else:
                return {"success": True, "changed": False, "message": "IDE diagnostics passed"}
        else:
            # Fallback to comprehensive quality checks
            return run_comprehensive_fallback(file_path)
            
    except Exception as e:
        # Fallback to comprehensive quality checks
        return run_comprehensive_fallback(file_path)


def run_comprehensive_fallback(file_path: str) -> Dict[str, Any]:
    """Run comprehensive quality checks when IDE diagnostics unavailable"""
    results = {
        "success": True,
        "changed": False,
        "errors": [],
        "warnings": [],
        "fixes": []
    }
    
    # 1. Format check and fix
    format_result = run_format_check(file_path)
    if format_result.get("changed"):
        results["fixes"].append("Code formatted")
        results["changed"] = True
    if not format_result.get("success"):
        results["errors"].append(f"Format error: {format_result.get('error', 'Unknown')}")
        results["success"] = False
    
    # 2. Lint check and fix
    lint_result = run_lint_check(file_path)
    if lint_result.get("changed"):
        results["fixes"].append("Linting issues fixed")
        results["changed"] = True
    if not lint_result.get("success"):
        if lint_result.get("warnings"):
            results["warnings"].append(f"Lint warnings: {lint_result.get('error', 'Unknown')}")
        else:
            results["errors"].append(f"Lint error: {lint_result.get('error', 'Unknown')}")
            results["success"] = False
    
    # 3. TypeScript type check
    type_result = run_type_check_fallback(file_path)
    if not type_result.get("success"):
        if type_result.get("warnings"):
            results["warnings"].append(f"Type errors: {type_result.get('error', 'Unknown')}")
        else:
            results["errors"].append(f"Type error: {type_result.get('error', 'Unknown')}")
            results["success"] = False
    
    # 4. Markdown lint check
    if file_path.endswith(('.md', '.mdx')):
        md_result = run_markdown_lint(file_path)
        if md_result.get("changed"):
            results["fixes"].append("Markdown formatting fixed")
            results["changed"] = True
        if not md_result.get("success"):
            if md_result.get("warnings"):
                results["warnings"].append(f"Markdown warnings: {md_result.get('error', 'Unknown')}")
            else:
                results["errors"].append(f"Markdown error: {md_result.get('error', 'Unknown')}")
                results["success"] = False
    
    # Combine messages for return
    if results["errors"]:
        return {"success": False, "error": "; ".join(results["errors"]), "warnings": len(results["warnings"]) > 0}
    elif results["warnings"]:
        return {"success": True, "changed": results["changed"], "warnings": "; ".join(results["warnings"])}
    else:
        message = "Comprehensive quality checks passed"
        if results["fixes"]:
            message += f" ({', '.join(results['fixes'])})"
        return {"success": True, "changed": results["changed"], "message": message}


def run_markdown_lint(file_path: str) -> Dict[str, Any]:
    """Run markdown linting with markdownlint-cli2"""
    try:
        # Run markdown lint with auto-fix
        result = subprocess.run(
            ["pnpm", "lint:md:fix", file_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            return {"success": True, "changed": True, "message": "Markdown linting completed"}
        else:
            # Check if there are remaining issues
            check_result = subprocess.run(
                ["pnpm", "lint:md", file_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if check_result.returncode == 0:
                return {"success": True, "changed": True, "message": "Markdown issues fixed"}
            else:
                return {"success": False, "error": check_result.stdout, "warnings": True}
                
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Markdown lint timed out"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def run_type_check_fallback(file_path: str) -> Dict[str, Any]:
    """Fallback TypeScript type checking using pnpm"""
    if not file_path.endswith(('.ts', '.tsx')):
        return {"success": True, "changed": False}
    
    try:
        result = subprocess.run(
            ["pnpm", "typecheck"],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            return {"success": True, "changed": False, "message": "Type check passed"}
        else:
            return {"success": False, "error": result.stdout, "warnings": True}
            
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Type check timed out"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def run_type_check(file_path: str) -> Dict[str, Any]:
    """Run IDE diagnostics first, fallback to TypeScript type checking"""
    return run_ide_diagnostics(file_path)


def run_spell_check(file_path: str) -> Dict[str, Any]:
    """Run spell checking with cspell"""
    if not file_path.endswith(('.ts', '.tsx', '.js', '.jsx', '.md', '.mdx', '.json')):
        return {"success": True, "changed": False}
    
    try:
        result = subprocess.run(
            ["pnpm", "cspell", file_path, "--no-progress"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            return {"success": True, "changed": False, "message": "Spelling check passed"}
        else:
            return {"success": False, "error": result.stdout, "warnings": True}
            
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Spell check timed out"}
    except Exception as e:
        return {"success": True, "changed": False}  # Don't fail on spell check errors


def process_file_quality_checks(file_path: str) -> Dict[str, Any]:
    """Run all quality checks for a file"""
    if should_skip_file(file_path):
        return {"skipped": True, "reason": "File ignored"}
    
    if not Path(file_path).exists():
        return {"skipped": True, "reason": "File not found"}
    
    results = {
        "file_path": file_path,
        "checks": {},
        "errors": [],
        "warnings": [],
        "fixes": []
    }
    
    # Run formatting
    format_result = run_format_check(file_path)
    results["checks"]["format"] = format_result
    if format_result.get("changed"):
        results["fixes"].append("Code formatted")
    if not format_result.get("success"):
        results["errors"].append(f"Format error: {format_result.get('error', 'Unknown')}")
    
    # Run linting
    lint_result = run_lint_check(file_path)
    results["checks"]["lint"] = lint_result
    if lint_result.get("changed"):
        results["fixes"].append("Linting issues fixed")
    if not lint_result.get("success"):
        if lint_result.get("warnings"):
            results["warnings"].append(f"Lint warnings: {lint_result.get('error', 'Unknown')}")
        else:
            results["errors"].append(f"Lint error: {lint_result.get('error', 'Unknown')}")
    
    # Run type checking
    type_result = run_type_check(file_path)
    results["checks"]["typecheck"] = type_result
    if not type_result.get("success"):
        if type_result.get("warnings"):
            results["warnings"].append(f"Type errors: {type_result.get('error', 'Unknown')}")
        else:
            results["errors"].append(f"Type error: {type_result.get('error', 'Unknown')}")
    
    # Run spell checking
    spell_result = run_spell_check(file_path)
    results["checks"]["spell"] = spell_result
    if not spell_result.get("success"):
        if spell_result.get("warnings"):
            results["warnings"].append(f"Spelling issues: {spell_result.get('error', 'Unknown')}")
    
    return results


def main():
    """Main hook entry point using cchooks"""
    try:
        # Create context using cchooks
        context = create_context()
        
        # Ensure this is a PostToolUse context
        if not isinstance(context, PostToolUseContext):
            print("❌ Invalid context - expected PostToolUse", file=sys.stderr)
            context.output.exit_success()
            return
        
        # Only process file modification tools
        if context.tool_name not in ["Write", "Edit", "MultiEdit"]:
            context.output.exit_success()
            return
        
        # Get file path from tool input
        file_path = context.tool_input.get("file_path")
        if not file_path:
            context.output.exit_success()
            return
        
        print(f"🔧 Running quality checks on {Path(file_path).name}...", file=sys.stderr)
        
        # Process the file
        results = process_file_quality_checks(file_path)
        
        if results.get("skipped"):
            print(f"⏭️  Skipped: {results['reason']}", file=sys.stderr)
            context.output.exit_success()
            return
        
        # Print results
        for fix in results["fixes"]:
            print(f"   ✨ {fix}", file=sys.stderr)
        
        for warning in results["warnings"]:
            print(f"   ⚠️  {warning}", file=sys.stderr)
        
        for error in results["errors"]:
            print(f"   ❌ {error}", file=sys.stderr)
        
        # Determine exit strategy
        if results["errors"]:
            context.output.exit_block(f"Quality issues found in {Path(file_path).name}")
        elif results["warnings"] or results["fixes"]:
            print("\n✅ Quality checks completed!\n", file=sys.stderr)
            context.output.exit_success("Quality checks completed with fixes/warnings")
        else:
            context.output.exit_success()
            
    except Exception as e:
        print(f"❌ Hook error: {e}", file=sys.stderr)
        # Use fallback exit on error
        sys.exit(0)


if __name__ == "__main__":
    main()